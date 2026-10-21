'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// An ink bloom: a noisy disc grows out of uOrigin until it covers the screen,
// then a hole opens from the same point and grows until the overlay is gone.
const fragmentShader = `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uOrigin;
  uniform float uAspect;
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorRim;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + vec2(13.7, 9.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Distance from the origin, aspect-corrected and normalized so 1.0 = farthest corner.
    vec2 p = vUv - uOrigin;
    p.x *= uAspect;
    vec2 far = vec2(max(uOrigin.x, 1.0 - uOrigin.x) * uAspect, max(uOrigin.y, 1.0 - uOrigin.y));
    float r = length(p) / length(far);

    // Domain-warped noise gives the edge its liquid, living shape.
    float t = uTime * 0.3;
    vec2 q = p * 2.2;
    vec2 warp = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, 1.3) - vec2(t, 0.0)));
    float w = fbm(q * 1.5 + 1.2 * warp);
    float edge = r + (w - 0.5) * 0.3;

    float coverP = smoothstep(0.0, 0.5, uProgress);
    float clearP = smoothstep(0.5, 1.0, uProgress);
    float front = coverP * 1.5 - 0.2;
    float back = clearP * 1.5 - 0.2;

    float covered = 1.0 - smoothstep(front - 0.012, front + 0.012, edge);
    float cleared = 1.0 - smoothstep(back - 0.012, back + 0.012, edge);
    float band = covered - cleared;

    float dFront = front - edge;
    float dBack = edge - back;
    float depth = clamp(min(dFront, dBack) * 2.2, 0.0, 1.0);

    // Body: deep ink in the middle, warmer toward the edges, with faint marbling and ripples.
    vec3 color = mix(uColorMid, uColorDeep, depth);
    color += uColorMid * (w - 0.45) * 0.5;
    color += uColorMid * 0.35 * sin(edge * 46.0 - uProgress * 28.0) * (1.0 - depth);

    // A hot line on both edges and a soft glow spilling past them.
    float rimLine = exp(-abs(dFront) * 70.0) + exp(-abs(dBack) * 70.0);
    color += uColorRim * rimLine * 0.9 + vec3(1.0, 0.9, 0.8) * pow(rimLine, 3.0) * 0.35;

    float glowF = exp(min(dFront, 0.0) * 22.0) * (1.0 - covered);
    float glowB = exp(min(dBack, 0.0) * 22.0) * cleared * step(0.001, clearP);
    float glow = (glowF + glowB) * 0.45;

    float live = step(0.0005, uProgress) * (1.0 - step(0.9995, uProgress));
    vec3 finalColor = mix(uColorRim, color, smoothstep(0.0, 1.0, band));
    gl_FragColor = vec4(finalColor, clamp(band + glow, 0.0, 1.0) * live);
  }
`

const DURATION = 1.8
// The screen is fully covered between ~38% and ~52% of the sweep; swap content in the middle.
const COVERED_AT = DURATION * 0.45

type Origin = { x: number; y: number }

const TransitionContext = createContext<{
  navigate: (href: string) => void
  play: (onCovered: () => void, origin?: Origin) => boolean
  progress: { value: number }
  origin: Origin
} | null>(null)

export function useTransition() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransition must be used inside <TransitionProvider>')
  return ctx
}

function Plane({ progress, origin }: { progress: { value: number }; origin: Origin }) {
  const mat = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uColorDeep: { value: new THREE.Color('#100a07') },
    uColorMid: { value: new THREE.Color('#4a1d0b') },
    uColorRim: { value: new THREE.Color('#ff8a4c') },
  }), [])

  useFrame(({ clock, size }) => {
    const u = mat.current.uniforms
    u.uProgress.value = progress.value
    u.uTime.value = clock.elapsedTime
    u.uAspect.value = size.width / size.height
    u.uOrigin.value.set(origin.x, origin.y)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const progress = useRef({ value: 0 })
  // Where the next bloom starts, in UV space (y up). Follows the pointer.
  const origin = useRef<Origin>({ x: 0.5, y: 0.5 })
  const pointer = useRef<Origin>({ x: 0.5, y: 0.5 })
  const router = useRouter()

  useEffect(() => {
    const track = (e: PointerEvent) => {
      pointer.current = { x: e.clientX / innerWidth, y: 1 - e.clientY / innerHeight }
    }
    window.addEventListener('pointermove', track, { passive: true })
    window.addEventListener('pointerdown', track, { passive: true })
    return () => {
      window.removeEventListener('pointermove', track)
      window.removeEventListener('pointerdown', track)
    }
  }, [])

  // Runs one full cover → reveal sweep and calls onCovered while the screen is hidden.
  // Returns false (and does nothing) if a sweep is still in progress.
  const play = useCallback((onCovered: () => void, from?: Origin) => {
    const v = progress.current.value
    if (v > 0 && v < 0.9) return false

    Object.assign(origin.current, from ?? pointer.current)
    gsap.killTweensOf(progress.current)
    progress.current.value = 0

    gsap.to(progress.current, {
      value: 1,
      duration: DURATION,
      ease: 'none',
      onComplete() {
        progress.current.value = 0
        window.dispatchEvent(new Event('transition:done'))
      },
    })
    gsap.delayedCall(COVERED_AT, onCovered)
    return true
  }, [])

  const navigate = useCallback((href: string) => {
    play(() => router.push(href))
  }, [play, router])

  const value = useMemo(
    () => ({ navigate, play, progress: progress.current, origin: origin.current }),
    [navigate, play],
  )

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <Canvas
        style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}
        onCreated={({ gl }) => { gl.domElement.style.pointerEvents = 'none' }}
      >
        <Plane progress={progress.current} origin={origin.current} />
      </Canvas>
    </TransitionContext.Provider>
  )
}

export function TransitionLink({ href, ...rest }: ComponentProps<'a'> & { href: string }) {
  const { navigate } = useTransition()

  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        e.preventDefault()
        navigate(href)
      }}
    />
  )
}
