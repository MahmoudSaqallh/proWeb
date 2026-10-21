'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTransition } from './PageTransition'
import { profile } from '../data/portfolio'
import Home from './sections/Home'
import Skills from './sections/Skills'
import Work from './sections/Work'
import Contact from './sections/Contact'

export type GoTo = (index: number, fromCenter?: boolean) => void

const SECTIONS = [
  { id: 'home', label: 'Home', Component: Home },
  { id: 'skills', label: 'Skills', Component: Skills },
  { id: 'work', label: 'Work', Component: Work },
  { id: 'contact', label: 'Contact', Component: Contact },
]

const pad = (n: number) => String(n + 1).padStart(2, '0')

// A wheel "gesture" ends after this much silence; one gesture moves one section,
// so trackpad momentum can't skip several sections at once.
const GESTURE_GAP = 250
const WHEEL_THRESHOLD = 40
const SWIPE_THRESHOLD = 50

export default function Portfolio() {
  const { play, origin } = useTransition()
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const direction = useRef(1)
  const stage = useRef<HTMLElement>(null)

  const show = useCallback((index: number) => {
    activeRef.current = index
    setActive(index)
    history.replaceState(null, '', `#${SECTIONS[index].id}`)
  }, [])

  const go = useCallback<GoTo>((index, fromCenter) => {
    const next = Math.max(0, Math.min(SECTIONS.length - 1, index))
    if (next === activeRef.current) return
    const started = play(() => show(next), fromCenter ? { x: 0.5, y: 0.5 } : undefined)
    if (!started) return

    direction.current = Math.sign(next - activeRef.current)
    // The outgoing section sinks back toward the point the bloom grows from.
    if (stage.current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(stage.current, {
        scale: 0.94,
        y: -40 * direction.current,
        opacity: 0.3,
        transformOrigin: `${origin.x * 100}% ${(1 - origin.y) * 100}%`,
        duration: 0.8,
        ease: 'power2.in',
      })
    }
  }, [play, show, origin])

  // Deep link: open the section named in the URL hash without a transition.
  useEffect(() => {
    const index = SECTIONS.findIndex((s) => `#${s.id}` === location.hash)
    if (index > 0) show(index)
  }, [show])

  useEffect(() => {
    let lastWheel = 0
    let accum = 0
    let consumed = false

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = performance.now()
      if (now - lastWheel > GESTURE_GAP) {
        consumed = false
        accum = 0
      }
      lastWheel = now
      if (consumed) return

      accum += e.deltaY
      if (Math.abs(accum) > WHEEL_THRESHOLD) {
        consumed = true
        go(activeRef.current + Math.sign(accum))
      }
    }

    const isTyping = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return
      const i = activeRef.current
      const target = {
        ArrowDown: i + 1, PageDown: i + 1, ' ': i + 1,
        ArrowUp: i - 1, PageUp: i - 1,
        Home: 0, End: SECTIONS.length - 1,
      }[e.key]
      if (target === undefined) return
      e.preventDefault()
      go(target, true)
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return
      const dy = touchY - e.changedTouches[0].clientY
      touchY = null
      if (Math.abs(dy) > SWIPE_THRESHOLD) go(activeRef.current + Math.sign(dy))
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [go])

  // Stagger the new section's content in while the shader reveals it.
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    el.focus({ preventScroll: true })
    el.dataset.ready = ''
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Content arrives from the side you scrolled toward.
      gsap.from('[data-reveal]', {
        y: 36 * direction.current,
        opacity: 0,
        duration: 0.9,
        delay: 0.25,
        stagger: 0.045,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      })
    }, el)
    return () => ctx.revert()
  }, [active])

  const { Component } = SECTIONS[active]

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-glow" />
        <div className="backdrop-floor" />
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => go(0)}>
          {profile.name}<span>.</span>
        </button>
        <nav className="topnav" aria-label="Sections">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              className="topnav-link"
              aria-current={i === active ? 'page' : undefined}
              onClick={() => go(i)}
            >
              <span>{pad(i)}</span>{s.label}
            </button>
          ))}
        </nav>
        <div className="counter" aria-hidden="true">
          <b>{pad(active)}</b> / {pad(SECTIONS.length - 1)}
        </div>
      </header>

      <main ref={stage} className="stage" tabIndex={-1} key={active} aria-label={SECTIONS[active].label}>
        <Component go={go} />
      </main>

      <nav className="pager" aria-label="Section dots">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className="pager-dot"
            aria-label={s.label}
            aria-current={i === active ? 'page' : undefined}
            onClick={() => go(i)}
          />
        ))}
      </nav>

      {active < SECTIONS.length - 1 && (
        <button className="hint" onClick={() => go(active + 1)} aria-label="Next section">
          <span className="hint-mouse" aria-hidden="true"><span /></span>
          <span className="hint-label hint-fine">Scroll</span>
          <span className="hint-label hint-coarse">Swipe up</span>
        </button>
      )}
    </div>
  )
}
