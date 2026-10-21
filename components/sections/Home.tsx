import Image from 'next/image'
import portrait from '../../app/profile (1).webp'
import { profile } from '../../data/portfolio'
import type { GoTo } from '../Portfolio'

export default function Home({ go }: { go: GoTo }) {
  return (
    <section className="section home">
      <div className="wrap home-grid">
        <div className="home-copy">
          <p className="eyebrow" data-reveal>
            <span className="status-dot" /> {profile.location}
          </p>
          <h1 className="home-title" data-reveal>
            Hi, I&apos;m {profile.name}<span className="accent">.</span>
          </h1>
          <p className="home-role" data-reveal>{profile.role}</p>
          <p className="home-intro" data-reveal>{profile.intro}</p>
          <div className="actions" data-reveal>
            <button className="btn btn-primary" onClick={() => go(2)}>View my work</button>
            <button className="btn btn-ghost" onClick={() => go(3)}>Get in touch</button>
          </div>
        </div>

        <figure className="portrait" data-reveal>
          <div className="portrait-frame">
            <Image src={portrait} alt={`Portrait of ${profile.name}`} priority sizes="(max-width: 900px) 40vw, 30vw" />
          </div>
          <figcaption className="portrait-caption">
            <span>{profile.name}</span>
            <span>{profile.role}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
