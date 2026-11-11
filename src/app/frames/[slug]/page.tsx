import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  DeviceScreen,
  StatusPill,
  SupportTag,
  paneIcon,
} from "@/components/DeviceBits";
import {
  changeLabels,
  isUnchanged,
  deviceBySlug,
  devices,
  type ChangeKey,
} from "@/lib/devices";
import { panes } from "@/lib/site";
import s from "./device.module.css";

export function generateStaticParams() {
  return devices.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  props: PageProps<"/frames/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const d = deviceBySlug(slug);
  if (!d) return {};
  return { title: d.name, description: d.summary };
}

type Params = PageProps<"/frames/[slug]">["params"];

/* The slug is URL data, so it's read inside <Suspense> to keep navigations
   instant. All devices are prerendered, so the fallback only shows briefly on
   an unprefetched client navigation; it keeps the page's shape so nothing jumps. */
export default function DevicePage(props: PageProps<"/frames/[slug]">) {
  return (
    <Suspense fallback={<DeviceFallback />}>
      <Device params={props.params} />
    </Suspense>
  );
}

function DeviceFallback() {
  return (
    <div className={`wrap ${s.page}`} aria-busy="true">
      <nav className={s.crumbs} aria-label="Breadcrumb">
        <Link href="/frames">Devices</Link>
      </nav>
      <div className={s.hero}>
        <div className={s.heroText}>
          <span className={s.ghostLine} />
          <span className={`${s.ghostLine} ${s.ghostTitle}`} />
        </div>
        <span className={s.ghostScreen} />
      </div>
    </div>
  );
}

async function Device({ params }: { params: Params }) {
  const { slug } = await params;
  const d = deviceBySlug(slug);
  if (!d) notFound();

  return (
    <article className={`wrap ${s.page}`}>
      <nav className={s.crumbs} aria-label="Breadcrumb">
        <Link href="/frames">Devices</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{d.name}</span>
      </nav>

      <header className={s.hero}>
        <div className={s.heroText}>
          <StatusPill status={d.status} />
          <h1 className={s.h1}>{d.name}</h1>
          {d.aka && <p className={s.aka}>{d.aka}</p>}
          <p className={s.lede}>{d.summary}</p>
          {d.project && (
            <p className={s.project}>
              Runs as <a href={d.project.href}>{d.project.name}</a>
            </p>
          )}
        </div>
        <DeviceScreen shape={d.shape} size="hero" />
      </header>

      {d.unverified && (
        <p className={s.caveat}>
          These details come from public writeups. Nobody has checked them on
          hardware yet.
        </p>
      )}

      <div className={s.cols}>
        <section className={s.section} aria-labelledby="specs">
          <h2 id="specs" className={s.h2}>
            Hardware
          </h2>
          <dl className={`glass ${s.specs}`}>
            {d.specs.map((sp) => (
              <div key={sp.label} className={s.spec}>
                <dt>{sp.label}</dt>
                <dd>{sp.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={s.section} aria-labelledby="panes">
          <h2 id="panes" className={s.h2}>
            Panes
          </h2>
          <ul className={`glass ${s.panes}`}>
            {panes.map((p) => {
              const Icon = paneIcon[p.id];
              const sup = d.panes[p.id];
              return (
                <li key={p.id} className={s.pane}>
                  <span className={s.paneIc}>
                    <Icon />
                  </span>
                  <span className={s.paneText}>
                    <span className={s.paneName}>{p.name}</span>
                    {sup.note && <span className={s.paneNote}>{sup.note}</span>}
                  </span>
                  <SupportTag support={sup.support} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className={s.section} aria-labelledby="changes">
        <h2 id="changes" className={s.h2}>
          {d.status === "works"
            ? "What installing changes"
            : "What installing will change"}
        </h2>
        <dl className={`glass ${s.specs} ${s.changeList}`}>
          {(Object.keys(changeLabels) as ChangeKey[]).map((k) => (
            <div key={k} className={s.spec}>
              <dt>{changeLabels[k]}</dt>
              <dd className={isUnchanged(d.changes[k]) ? s.calm : undefined}>
                {d.changes[k]}
              </dd>
            </div>
          ))}
        </dl>
        {d.changesNote && <p className={s.note}>{d.changesNote}</p>}
        {d.status !== "works" && (
          <p className={s.note}>
            Expected, from the plan. Nothing has been run on this device yet.
          </p>
        )}
      </section>

      <section className={s.section} aria-labelledby="install">
        <h2 id="install" className={s.h2}>
          Install
        </h2>
        <div className={`glass ${s.install}`}>
          <p>{d.install.how}</p>
          {d.install.href && (
            <a href={d.install.href} className={s.cta}>
              {d.install.cta}
            </a>
          )}
        </div>
      </section>
    </article>
  );
}
