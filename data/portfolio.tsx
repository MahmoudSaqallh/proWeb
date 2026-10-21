import type { ReactNode } from 'react'
import {
  SiAndroid, SiDart, SiExpress, SiFigma, SiFlutter, SiGit, SiGithub, SiGreensock,
  SiJavascript, SiMongodb, SiNextdotjs, SiNodedotjs, SiPostman, SiReact,
  SiSocketdotio, SiTailwindcss, SiThreedotjs, SiTypescript,
} from 'react-icons/si'
import { LuBraces, LuShieldCheck } from 'react-icons/lu'

// Edit everything on the site from this file.

export const profile = {
  name: 'Mahmoud',
  role: 'Full-Stack & Mobile Developer',
  intro:
    'I build fast, polished web and mobile products — from typed APIs and realtime backends to interfaces with motion and 3D.',
  location: 'Available for remote work',
  // Contact links. Leave one empty ('') to hide it on the live site;
  // in `npm run dev` empty ones show as dimmed placeholders so you can see the layout.
  email: 'adamsakallh@gmail.com',
  linkedin: '', // e.g. 'https://www.linkedin.com/in/your-name'
  phone: '', // e.g. '+970 59 123 4567'
  cv: '', // put the file in /public and write its path, e.g. '/cv.pdf'
}

export type Skill = { name: string; note: string; icon: ReactNode }
export type SkillGroup = { title: string; summary: string; accent: string; items: Skill[] }

export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    summary: 'Interfaces, motion and rendering',
    accent: '#ff6a3d',
    items: [
      { name: 'React', note: 'Component architecture', icon: <SiReact /> },
      { name: 'Next.js', note: 'Full stack web applications', icon: <SiNextdotjs /> },
      { name: 'TypeScript', note: 'Typed contracts', icon: <SiTypescript /> },
      { name: 'JavaScript', note: 'Language of the web', icon: <SiJavascript /> },
      { name: 'Tailwind', note: 'Utility-first UI', icon: <SiTailwindcss /> },
      { name: 'GSAP', note: 'Advanced motion', icon: <SiGreensock /> },
      { name: 'Three.js', note: 'Interactive 3D web', icon: <SiThreedotjs /> },
    ],
  },
  {
    title: 'Backend',
    summary: 'APIs, data and realtime',
    accent: '#f5b84b',
    items: [
      { name: 'Node.js', note: 'Backend services', icon: <SiNodedotjs /> },
      { name: 'Express', note: 'REST APIs', icon: <SiExpress /> },
      { name: 'MongoDB', note: 'Database modeling', icon: <SiMongodb /> },
      { name: 'REST APIs', note: 'API design', icon: <LuBraces /> },
      { name: 'Socket.IO', note: 'Realtime', icon: <SiSocketdotio /> },
      { name: 'Authentication', note: 'JWT, sessions, roles', icon: <LuShieldCheck /> },
    ],
  },
  {
    title: 'Mobile',
    summary: 'Native-feeling apps from one codebase',
    accent: '#e8d5b5',
    items: [
      { name: 'Flutter', note: 'Cross-platform mobile apps', icon: <SiFlutter /> },
      { name: 'Dart', note: 'Typed app logic', icon: <SiDart /> },
      { name: 'Android', note: 'Platform releases', icon: <SiAndroid /> },
    ],
  },
  {
    title: 'Tools',
    summary: 'Design, testing and delivery',
    accent: '#8a817a',
    items: [
      { name: 'Git', note: 'Version control', icon: <SiGit /> },
      { name: 'GitHub', note: 'CI & reviews', icon: <SiGithub /> },
      { name: 'Postman', note: 'API testing', icon: <SiPostman /> },
      { name: 'Figma', note: 'UI handoff', icon: <SiFigma /> },
    ],
  },
]

export type Project = {
  title: string
  kind: string
  year: string
  description: string
  stack: string[]
  // Optional: a screenshot path in /public (e.g. '/work/logisphere.jpg') and live/source links.
  image?: string
  live?: string
  source?: string
}

export const projects: Project[] = [
  {
    title: 'Logisphere',
    kind: 'Logistics platform',
    year: '2025',
    description:
      'Move everything, control every moment — shipment tracking, fleet operations and live delivery status in one dashboard.',
    stack: ['Next.js', 'Node.js', 'MongoDB', 'Socket.IO'],
  },
  {
    title: 'Jamra',
    kind: 'Restaurant ordering',
    year: '2025',
    description:
      'A bilingual Arabic / English ordering experience with a browsable menu, cart and checkout built for RTL.',
    stack: ['Next.js', 'Tailwind', 'Express', 'MongoDB'],
  },
  {
    title: 'Shader Portfolio',
    kind: 'Interactive site',
    year: '2026',
    description:
      'This site — a scroll-free portfolio where each section is revealed by a WebGL ink-bloom transition that grows from the cursor.',
    stack: ['Next.js', 'Three.js', 'R3F', 'GSAP'],
  },
]
