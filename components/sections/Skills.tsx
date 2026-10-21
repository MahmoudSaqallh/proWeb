import type { CSSProperties } from 'react'
import { skillGroups } from '../../data/portfolio'

export default function Skills() {
  return (
    <section className="section skills">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="eyebrow">02 — Skills</p>
          <h2 className="section-title">What I work with</h2>
        </header>

        <div className="skills-grid">
          {skillGroups.map((group, gi) => (
            <div key={group.title} className="skill-group" style={{ '--accent': group.accent } as CSSProperties}>
              <div className="group-head" data-reveal>
                <span className="group-index">{String(gi + 1).padStart(2, '0')}</span>
                <h3 className="group-title">{group.title}</h3>
                <span className="group-dot" aria-hidden="true" />
              </div>
              <p className="group-summary" data-reveal>{group.summary}</p>

              <ul className="tree">
                {group.items.map((skill) => (
                  <li key={skill.name} className="skill" data-reveal>
                    <span className="skill-icon" aria-hidden="true">{skill.icon}</span>
                    <span className="skill-text">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-note">{skill.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
