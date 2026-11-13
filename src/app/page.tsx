import { PaneGrid } from "@/components/PaneGrid";
import { StackStory } from "@/components/StackStory";
import Link from "next/link";
import { FrameCard } from "@/components/FrameCard";
import { ClarityCardLine } from "@/components/clarity/Clarity";
import { frames } from "@/lib/frames";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={`wrap ${styles.page}`}>
      <StackStory />

      <section className={styles.section} aria-labelledby="panes">
        <div className={styles.headRow}>
          <h2 id="panes" className={styles.h2}>
            Panes
          </h2>
          <Link href="/panes" className={styles.more}>
            All panes
          </Link>
        </div>
        <PaneGrid />
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
          {frames.map((f) => (
            <li key={f.id}>
              <FrameCard f={f}>
              <ClarityCardLine frameId={f.id} />
            </FrameCard>
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
