import { GlassTile } from "@/components/GlassTile";
import { Stack } from "@/components/Stack";
import {
  BaseGlyph,
  MicGlyph,
  MusicGlyph,
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
          <h1 className={styles.h1}>
            The open core for Home Assistant wall panels.
          </h1>
          <p className={styles.lede}>
            Dashboard, ESPHome device, setup and updates for any wall panel.
            Everything else is a pane: voice, music, Zigbee/Thread, or one you
            write.
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
            Not released yet. It&rsquo;s being split out of S1 Unleashed, which{" "}
            <a href={links.s1Install}>installs on the Aqara S1 Plus today</a>.
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
          <h2 id="fits" className={styles.h2}>
            How it&rsquo;s built
          </h2>
          <p className={styles.sectionLede}>
            A frame holds panes, and Kiln installs it. Supporting a new panel
            means writing a new frame.
          </p>
        </div>
        <Stack />
      </section>

      <section className={styles.section} aria-labelledby="panes">
        <h2 id="panes" className={styles.h2}>
          Panes
        </h2>
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
        <h2 id="frames" className={styles.h2}>
          Frames
        </h2>
        <ul className={styles.frames}>
          {frames.map((f) => (
            <li key={f.name} className={`glass ${styles.frame}`}>
              <span
                className={`${styles.thumb} ${f.ratio === "square" ? styles.square : ""}`}
                aria-hidden="true"
              />
              <div className={styles.frameText}>
                <div className={styles.frameTop}>
                  <h3 className={styles.frameName}>{f.name}</h3>
                  <span className={`${styles.pill} ${styles[f.status]}`}>
                    {statusText[f.status]}
                  </span>
                </div>
                <p className={styles.project}>{f.project}</p>
                <p>{f.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className={`${styles.section} ${styles.why}`}
        aria-labelledby="why"
      >
        <div className={styles.head}>
          <h2 id="why" className={styles.h2}>
            Why Apache-2.0
          </h2>
          <p className={styles.whyLede}>
            Most full-featured panel apps are closed or non-commercial.
          </p>
        </div>
        <div className={styles.trio}>
          <div className={styles.point}>
            <h3>Port it</h3>
            <p>Write a frame for your device.</p>
          </div>
          <div className={styles.point}>
            <h3>Fork it</h3>
            <p>Anyone can carry it on.</p>
          </div>
          <div className={styles.point}>
            <h3>Ship it</h3>
            <p>Sell panels that run it.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
