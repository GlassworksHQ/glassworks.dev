import type { Metadata } from "next";
import Link from "next/link";
import {
  DeviceScreen,
  RatingLabel,
  RatingTags,
  RatingValue,
  StatusPill,
  SupportTag,
  paneIcon,
} from "@/components/DeviceBits";
import { devices, difficultyHelp, ratingKeys } from "@/lib/devices";
import { links, panes } from "@/lib/site";
import s from "./frames.module.css";

export const metadata: Metadata = {
  title: "Devices",
  description:
    "Panels Glassworks runs on, or will, and which panes work on each.",
};

export default function DevicesPage() {
  return (
    <div className={`wrap ${s.page}`}>
      <header className={s.head}>
        <span className="label">Catalog</span>
        <h1 className={s.h1}>Devices</h1>
        <p className={s.lede}>
          Panels Glassworks runs on, or will. Each one is a frame.
        </p>
      </header>

      <ul className={s.grid}>
        {devices.map((d) => (
          <li key={d.slug}>
            <Link href={`/frames/${d.slug}`} className={`glass ${s.card}`}>
              <DeviceScreen shape={d.shape} />
              <div className={s.cardText}>
                <div className={s.cardTop}>
                  <h2 className={s.name}>{d.name}</h2>
                  <StatusPill status={d.status} />
                </div>
                {d.aka && <p className={s.aka}>{d.aka}</p>}
                <p>{d.summary}</p>
                <RatingTags
                  ratings={d.ratings}
                  expected={d.status !== "works"}
                />
              </div>
            </Link>
          </li>
        ))}
        <li>
          <a href={links.org} className={s.add}>
            <span className={s.addPlus} aria-hidden="true">
              +
            </span>
            <h2 className={s.name}>Your panel</h2>
            <p>
              Any Android panel can be a frame. A guide to writing one comes
              with the first release; until then, follow along on GitHub.
            </p>
          </a>
        </li>
      </ul>

      <section className={s.section} aria-labelledby="changes">
        <h2 id="changes" className={s.h2}>
          What installing changes
        </h2>
        <div className={`glass ${s.tableWrap}`}>
          <table className={`${s.table} ${s.changes}`}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Change</span>
                </th>
                {devices.map((d) => (
                  <th key={d.slug} scope="col">
                    <Link href={`/frames/${d.slug}`}>{d.name}</Link>
                    {d.status !== "works" && (
                      <span className={s.expected}>expected</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ratingKeys.map((k) => (
                <tr key={k}>
                  <th scope="row">
                    <RatingLabel field={k} />
                  </th>
                  {devices.map((d) => (
                    <td key={d.slug}>
                      <RatingValue field={k} rating={d.ratings[k]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className={s.legend}>
          {difficultyHelp.map((h) => (
            <div key={h.name}>
              <dt>{h.name}</dt>
              <dd>{h.means}</dd>
            </div>
          ))}
        </dl>
        <p className={s.note}>
          Planned devices show what the install is expected to do. Nothing has
          been run on them yet.
        </p>
      </section>

      <section className={s.section} aria-labelledby="matrix">
        <h2 id="matrix" className={s.h2}>
          Panes by device
        </h2>
        <div className={`glass ${s.tableWrap}`}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">Pane</th>
                {devices.map((d) => (
                  <th key={d.slug} scope="col">
                    <Link href={`/frames/${d.slug}`}>{d.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {panes.map((p) => {
                const Icon = paneIcon[p.id];
                return (
                  <tr key={p.id}>
                    <th scope="row">
                      <span className={s.paneCell}>
                        <Icon className={s.paneIcon} />
                        {p.name}
                      </span>
                    </th>
                    {devices.map((d) => (
                      <td key={d.slug} title={d.panes[p.id].note}>
                        <SupportTag support={d.panes[p.id].support} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={s.note}>
          &ldquo;Depends&rdquo; means it needs hardware some devices have.
          &ldquo;Not checked&rdquo; means nobody has confirmed it on a real
          device yet.
        </p>
      </section>
    </div>
  );
}
