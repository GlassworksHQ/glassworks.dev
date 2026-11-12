import type { Metadata } from "next";
import Link from "next/link";
import { SupportTag, paneIcon } from "@/components/DeviceBits";
import { deviceBySlug, devices } from "@/lib/devices";
import { framePanes, generalPanes, links } from "@/lib/site";
import f from "../frames/frames.module.css";
import s from "./panes.module.css";

export const metadata: Metadata = {
  title: "Panes",
  description:
    "Plugins for Glassworks panels: what each does, what it needs, and where it runs.",
};

export default function PanesPage() {
  return (
    <div className={`wrap ${f.page}`}>
      <header className={f.head}>
        <span className="label">Catalog</span>
        <h1 className={f.h1}>Panes</h1>
        <p className={f.lede}>
          Plugins. Each one declares the hardware it needs, and runs on any
          frame that has it.
        </p>
      </header>

      <ul className={f.grid}>
        {generalPanes.map((p) => {
          const Icon = paneIcon[p.id];
          return (
            <li key={p.id}>
              <div className={`glass ${f.card}`}>
                <div className={s.top}>
                  <span className={s.icon}>
                    <Icon />
                  </span>
                  <div className={s.text}>
                    <h2 className={f.name}>{p.name}</h2>
                    <p>{p.does}</p>
                    <p className={s.needs}>
                      <span>Needs</span> {p.requires}
                    </p>
                  </div>
                </div>
                <div className={s.runs}>
                  <span className="label">Runs on</span>
                  <ul className={s.devices}>
                    {devices.map((d) => {
                      const support = d.panes[p.id];
                      return (
                        <li key={d.slug}>
                          <Link href={`/frames/${d.slug}`}>{d.name}</Link>
                          <SupportTag support={support.support} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
        <li>
          <a href={links.org} className={f.add}>
            <span className={f.addPlus} aria-hidden="true">
              +
            </span>
            <h2 className={f.name}>Your pane</h2>
            <p>
              A pane is a plugin that declares what it <code>requires</code>.
              A guide to writing one comes with the first release; until then,
              follow along on GitHub.
            </p>
          </a>
        </li>
      </ul>

      {framePanes.length > 0 && (
        <section className={f.section} aria-labelledby="frame-panes">
          <h2 id="frame-panes" className={f.h2}>
            Frame panes
          </h2>
          <p className={f.note}>
            Some panes belong to one device, like a wired base or a relay, so
            they live in that frame and are listed on its page:{" "}
            {framePanes.map((p, i) => {
              const d = p.frame ? deviceBySlug(p.frame) : undefined;
              return (
                <span key={p.id}>
                  {i > 0 && ", "}
                  {d ? (
                    <Link href={`/frames/${d.slug}`}>
                      {p.name} ({d.name})
                    </Link>
                  ) : (
                    p.name
                  )}
                </span>
              );
            })}
            .
          </p>
        </section>
      )}
    </div>
  );
}
