import type { ReactElement } from 'react'
import { SiGmail } from 'react-icons/si'
import { LuArrowUpRight, LuDownload, LuFileText, LuLinkedin, LuPhone } from 'react-icons/lu'
import { profile } from '../../data/portfolio'

type ContactLink = {
  label: string
  value: string
  href: string
  icon: ReactElement
  action: ReactElement
  download?: boolean
  external?: boolean
}

const showPlaceholders = process.env.NODE_ENV === 'development'

export default function Contact() {
  const links: (ContactLink | null)[] = [
    profile.cv || showPlaceholders ? {
      label: 'Résumé',
      value: profile.cv ? 'Download CV (PDF)' : 'Set profile.cv',
      href: profile.cv,
      icon: <LuFileText />,
      action: <LuDownload />,
      download: true,
    } : null,
    profile.linkedin || showPlaceholders ? {
      label: 'LinkedIn',
      value: profile.linkedin
        ? profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com/, '').replace(/\/$/, '')
        : 'Set profile.linkedin',
      href: profile.linkedin,
      icon: <LuLinkedin />,
      action: <LuArrowUpRight />,
      external: true,
    } : null,
    profile.email || showPlaceholders ? {
      label: 'Gmail',
      value: profile.email || 'Set profile.email',
      href: profile.email && `mailto:${profile.email}`,
      icon: <SiGmail />,
      action: <LuArrowUpRight />,
    } : null,
    profile.phone || showPlaceholders ? {
      label: 'Phone',
      value: profile.phone || 'Set profile.phone',
      href: profile.phone && `tel:${profile.phone.replace(/[^\d+]/g, '')}`,
      icon: <LuPhone />,
      action: <LuArrowUpRight />,
    } : null,
  ]

  return (
    <section className="section contact">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <header className="section-head" data-reveal>
            <p className="eyebrow">04 — Contact</p>
            <h2 className="section-title">Let&apos;s build something together</h2>
          </header>
          <p className="contact-intro" data-reveal>
            Have a product in mind or a team that needs another developer? Reach out through any of these and I&apos;ll get back to you.
          </p>
          <p className="eyebrow contact-status" data-reveal>
            <span className="status-dot" /> {profile.location}
          </p>
        </div>

        <ul className="contact-cards">
          {links.filter((l): l is ContactLink => l !== null).map((link) => (
            <li key={link.label} data-reveal>
              <a
                className="contact-card"
                href={link.href || undefined}
                aria-disabled={!link.href || undefined}
                download={link.download || undefined}
                target={link.external || link.download ? '_blank' : undefined}
                rel="noreferrer"
              >
                <span className="contact-card-top">
                  <span className="skill-icon" aria-hidden="true">{link.icon}</span>
                  <span className="contact-card-action" aria-hidden="true">{link.action}</span>
                </span>
                <span className="contact-card-label">{link.label}</span>
                <span className="contact-card-value">{link.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
