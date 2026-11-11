import { GlassTile } from "@/components/GlassTile";
import {
  BaseGlyph,
  FrameGlyph,
  KilnGlyph,
  MicGlyph,
  MusicGlyph,
  PaneGlyph,
  RadioGlyph,
  SensorGlyph,
  TimerGlyph,
} from "@/components/Glyphs";
import { frames, links, panes, type PaneId, type Status } from "@/lib/site";
import styles from "./page.module.css";

const paneIcon: Record<PaneId, typeof MicGlyph> = {
  assist: MicGlyph,
  timers: TimerGlyph,
  sendspin: MusicGlyph,
  radio: RadioGlyph,
  sensors: SensorGlyph,
  base: BaseGlyph,
};

const statusText: Record<Status, string> = {
  works: "Works today",
  planned: "Planned",
  experimental: "Experimental",
};

export default function Home() {
  return (
    <div className={`wrap ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className="label">Open source · Apache-2.0</span>
          <h1 className={styles.h1}>The open core for Home Assistant wall panels.</h1>
          <p className={styles.lede}>
            Glassworks is what a wall panel needs to become a good Home Assistant dashboard: the dashboard shell, a
            native ESPHome device, setup and updates. Voice, music and the Zigbee/Thread radio plug in as panes. You can
            port it to your hardware, fork it and ship panels with it.
          </p>
          <div className={styles.ctas}>
            <a className={styles.primary} href={links.org}>
              Follow on GitHub
            </a>
            <a className={styles.secondary} href={links.s1}>
              See S1 Unleashed
            </a>
          </div>
          <p className={styles.note}>
            Glassworks is being split out of S1 Unleashed now, so there&rsquo;s nothing to install from here yet. If you
            have an Aqara S1 Plus, <a href={links.s1Install}>S1 Unleashed installs today</a>.
          </p>
        </div>
        <div className={styles.heroTile}>
          <GlassTile
            label="Open core for wall panels"
            status="In progress"
            tone="working"
            footLeft="Frames · Panes · Kiln"
            footRight="glassworks.dev"
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="fits">
        <div className={styles.head}>
          <span className="label">How it fits</span>
          <h2 id="fits" className={styles.h2}>
            A frame holds panes. Kiln installs it.
          </h2>
        </div>
        <div className={styles.trio}>
          <article className={`glass ${styles.term}`}>
            <FrameGlyph className={styles.termIcon} />
            <h3 className={styles.termName}>Frame</h3>
            <p>One device: its hardware, what it can do, and which panes it ships. Each build has exactly one.</p>
          </article>
          <article className={`glass ${styles.term}`}>
            <PaneGlyph className={styles.termIcon} />
            <h3 className={styles.termName}>Pane</h3>
            <p>
              A plugin. A pane says what it needs and a frame says what it has. Panes a frame can&rsquo;t run stay
              listed, with the reason.
            </p>
          </article>
          <article className={`glass ${styles.term}`}>
            <KilnGlyph className={styles.termIcon} />
            <h3 className={styles.termName}>Kiln</h3>
            <p>The installer. It runs in your browser over USB and turns a stock device into a panel, one recipe per frame.</p>
          </article>
        </div>
        <p className={styles.example}>
          S1 Unleashed is a Glassworks frame with the radio and wall-base panes, installed with Kiln.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="panes">
        <div className={styles.head}>
          <span className="label">Panes</span>
          <h2 id="panes" className={styles.h2}>
            Pick what your panel does.
          </h2>
        </div>
        <ul className={styles.panes}>
          {panes.map((p) => {
            const Icon = paneIcon[p.id];
            return (
              <li key={p.id} className={`glass ${styles.pane}`}>
                <span className={styles.paneIcon}>
                  <Icon />
                </span>
                <div className={styles.paneText}>
                  <h3 className={styles.paneName}>{p.name}</h3>
                  <p>{p.does}</p>
                  <p className={styles.needs}>
                    <span>Needs</span> {p.requires}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="frames">
        <div className={styles.head}>
          <span className="label">Frames</span>
          <h2 id="frames" className={styles.h2}>
            Starting with one panel, built for more.
          </h2>
        </div>
        <ul className={styles.frames}>
          {frames.map((f) => (
            <li key={f.name} className={`glass ${styles.frame}`}>
              <span className={`${styles.thumb} ${f.ratio === "square" ? styles.square : ""}`} aria-hidden="true" />
              <div className={styles.frameText}>
                <div className={styles.frameTop}>
                  <h3 className={styles.frameName}>{f.name}</h3>
                  <span className={`${styles.pill} ${styles[f.status]}`}>{statusText[f.status]}</span>
                </div>
                <p className={styles.project}>{f.project}</p>
                <p>{f.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.section} ${styles.why}`} aria-labelledby="why">
        <div className={styles.head}>
          <span className="label">Why it&rsquo;s open</span>
          <h2 id="why" className={styles.h2}>
            A base other projects can build on.
          </h2>
          <p className={styles.whyLede}>
            The most complete panel apps today are closed or licensed for non-commercial use only. That means no ports
            to new hardware, no forks if the maintainer stops, and no panels for sale. Glassworks is Apache-2.0 so all
            three are allowed.
          </p>
        </div>
        <div className={styles.trio}>
          <div className={styles.point}>
            <h3>Port it</h3>
            <p>Write a frame for your device. The core doesn&rsquo;t know or care which panel it runs on.</p>
          </div>
          <div className={styles.point}>
            <h3>Fork it</h3>
            <p>If the project goes quiet, anyone can carry it on. The license makes sure of that.</p>
          </div>
          <div className={styles.point}>
            <h3>Ship it</h3>
            <p>Integrators and panel makers can sell devices that run Glassworks.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
