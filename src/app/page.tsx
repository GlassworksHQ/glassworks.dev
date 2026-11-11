import { GlassTile } from "@/components/GlassTile";
import { Stack } from "@/components/Stack";
import Link from "next/link";
import {
  ChangeTags,
  DeviceScreen,
  StatusPill,
  paneIcon,
} from "@/components/DeviceBits";
import { devices } from "@/lib/devices";
import { links, panes } from "@/lib/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={`wrap ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className="label">Open source · MPL-2.0</span>
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
        <div className={styles.headRow}>
          <h2 id="frames" className={styles.h2}>
            Devices
          </h2>
          <Link href="/frames" className={styles.more}>
            All devices
          </Link>
        </div>
        <ul className={styles.frames}>
          {devices.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/frames/${d.slug}`}
                className={`glass ${styles.frame}`}
              >
                <DeviceScreen shape={d.shape} />
                <div className={styles.frameText}>
                  <div className={styles.frameTop}>
                    <h3 className={styles.frameName}>{d.name}</h3>
                    <StatusPill status={d.status} />
                  </div>
                  <p>{d.summary}</p>
                  <ChangeTags tags={d.tags} expected={d.status !== "works"} />
                </div>
              </Link>
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
            Why MPL-2.0
          </h2>
          <p className={styles.whyLede}>
            Most full-featured panel apps are closed or non-commercial. With
            MPL-2.0, Glassworks stays open and your product doesn&rsquo;t have
            to.
          </p>
        </div>
        <div className={styles.trio}>
          <div className={styles.point}>
            <h3>Port it</h3>
            <p>Write a frame for your device.</p>
          </div>
          <div className={styles.point}>
            <h3>Ship it</h3>
            <p>Sell panels. Your frames and panes can stay closed.</p>
          </div>
          <div className={styles.point}>
            <h3>Share back</h3>
            <p>Changes to Glassworks&rsquo; own files stay open.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
