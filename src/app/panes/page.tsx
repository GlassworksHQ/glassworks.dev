import type { Metadata } from "next";
import Link from "next/link";
import { PaneGrid } from "@/components/PaneGrid";
import { SupportTag, paneIcon } from "@/components/DeviceBits";
import { frameById } from "@/lib/frames";
import type { Support } from "@/lib/frameText";
import { framePanes } from "@/lib/site";
import s from "./panes.module.css";

export const metadata: Metadata = {
  title: "Panes",
  description: "Plugins for Glassworks panels: what each does, what it needs, and where it runs.",
};

export default function PanesPage() {
  return (
    <div className={`wrap ${s.page}`}>
      <header className={s.head}>
        <span className="label">Catalog</span>
        <h1 className={s.h1}>Panes</h1>
        <p className={s.lede}>
          Everything a panel does beyond the core is a pane. Each one declares the hardware it needs, and runs on any
          frame that has it.
        </p>
      </header>

      <PaneGrid />

      <ul className={s.key} aria-label="Key">
        {(["stable", "beta", "alpha", "development", "planned", "depends", "unknown", "no"] as Support[]).map((k) => (
          <li key={k}>
            <SupportTag support={k} />
          </li>
        ))}
      </ul>

      {framePanes.length > 0 && (
        <section className={s.frameSection} aria-labelledby="frame-panes">
          <div className={s.frameHead}>
            <h2 id="frame-panes" className={s.h2}>
              Frame panes
            </h2>
            <p className={s.lede}>
              Some panes belong to one device, like a wired base or a relay. They live in that frame and are listed on
              its page.
            </p>
          </div>
          <ul className={s.frameList}>
            {framePanes.map((p) => {
              const Icon = paneIcon[p.id];
              const d = p.frame ? frameById(p.frame) : undefined;
              if (p.frame && !d) throw new Error(`src/lib/site.ts: pane "${p.id}" names frame "${p.frame}", which no frame.json has`);
              return (
                <li key={p.id}>
                  <Link href={`/panes/${p.id}`} className={s.frameRow}>
                    <span className={s.frameIcon}>
                      <Icon />
                    </span>
                    <span className={s.frameText}>
                      <span className={s.frameName}>{p.name}</span>
                      <span className={s.frameOf}>{d ? d.name : "Frame pane"}</span>
                    </span>
                    <span className={s.frameDoes}>{p.does}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
