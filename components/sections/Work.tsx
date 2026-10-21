import { LuArrowUpRight, LuGithub } from 'react-icons/lu'
import { projects } from '../../data/portfolio'

export default function Work() {
  return (
    <section className="section work">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="eyebrow">03 — Selected work</p>
          <h2 className="section-title">Things I&apos;ve built</h2>
        </header>

        <ul className="work-grid">
          {projects.map((project, i) => (
            <li key={project.title} className="project" data-reveal>
              <div className="project-preview" aria-hidden="true">
                {project.image ? (
                  <img src={project.image} alt="" />
                ) : (
                  <div className="project-mock">
                    <span className="project-mock-kind">{project.kind}</span>
                    <span className="project-mock-title">{project.title}</span>
                  </div>
                )}
              </div>

              <div className="project-body">
                <p className="project-meta">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{project.kind}</span>
                  <span>{project.year}</span>
                </p>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <ul className="project-stack">
                  {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
                </ul>
                {(project.live || project.source) && (
                  <div className="project-links">
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noreferrer">
                        Visit site <LuArrowUpRight aria-hidden="true" />
                      </a>
                    )}
                    {project.source && (
                      <a href={project.source} target="_blank" rel="noreferrer">
                        <LuGithub aria-hidden="true" /> Source
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
