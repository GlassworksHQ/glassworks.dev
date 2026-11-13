import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SupportTag, paneIcon } from "@/components/DeviceBits";
import { PaneLift } from "@/components/PaneLift";
import { TiltCard } from "@/components/TiltCard";
import { frameById, frames } from "@/lib/frames";
import { ships } from "@/lib/frameText";
import { panes } from "@/lib/site";
import s from "./pane.module.css";

const paneById = (id: string) => panes.find((p) => p.id === id);

export function generateStaticParams() {
  return panes.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/panes/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const p = paneById(id);
  if (!p) return {};
  return { title: p.name, description: `${p.does} Needs: ${p.requires}.` };
}

type Params = PageProps<"/panes/[id]">["params"];

/* Same shape as the devices pages: the id is read inside <Suspense>, and the
   fallback keeps the page's outline so nothing jumps. */
export default function PanePage(props: PageProps<"/panes/[id]">) {
  return (
    <Suspense fallback={<div className={`wrap ${s.page}`} aria-busy="true" />}>
      <Pane params={props.params} />
    </Suspense>
  );
}

async function Pane({ params }: { params: Params }) {
  const { id } = await params;
  const p = paneById(id);
  if (!p) notFound();
  const Icon = paneIcon[p.id];
  const frame = p.frame ? frameById(p.frame) : undefined;
  // a frame pane only means something on its own device
  const rows = frame ? [frame] : frames;
  const runsOn = rows.filter((d) => ships(d.panes[p.id].support)).length;

  return (
    <div className={`wrap ${s.page}`}>
      <nav className={s.crumbs} aria-label="Breadcrumb">
        <Link href="/panes">Panes</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <header className={s.hero}>
        <div className={s.heroText}>
          <span className="label">{frame ? `Frame pane · ${frame.name}` : "Pane"}</span>
          <h1 className={s.h1}>{p.name}</h1>
          <p className={s.lede}>{p.does}</p>
          <dl className={s.facts}>
            <div>
              <dt>Needs</dt>
              <dd>{p.requires}</dd>
            </div>
            <div>
              <dt>Runs on</dt>
              <dd>
                {runsOn} of {rows.length} {rows.length === 1 ? "device" : "devices"}
              </dd>
            </div>
            <div>
              <dt>Kind</dt>
              <dd>{frame ? "Frame pane: lives in its frame" : "General: any frame with the hardware"}</dd>
            </div>
          </dl>
        </div>
        <TiltCard className={s.stage}>
          <div className={s.lifted}>
            <PaneLift Icon={Icon} frame={Boolean(frame)} lifted />
          </div>
        </TiltCard>
      </header>

      <section className={s.section} aria-labelledby="where">
        <h2 id="where" className={s.h2}>
          Where it runs
        </h2>
        <ul className={`glass ${s.devices}`}>
          {rows.map((d) => {
            const support = d.panes[p.id];
            return (
              <li key={d.id}>
                <Link href={`/frames/${d.id}`} className={s.device}>
                  <span className={s.deviceName}>{d.name}</span>
                  <SupportTag support={support.support} />
                  {support.note && <span className={s.note}>{support.note}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Link href="/panes" className={s.back}>
        All panes
      </Link>
    </div>
  );
}
