import type { Metadata } from "next";
import Link from "next/link";
import s from "./trademarks.module.css";

export const metadata: Metadata = {
  title: "Trademarks",
  description: "How you can use the Glassworks name, mark and badge.",
};

const ASK =
  "https://github.com/GlassworksHQ/.github/issues/new?title=Trademark%20request";

export default function TrademarksPage() {
  return (
    <article className={`wrap ${s.page}`}>
      <header className={s.head}>
        <span className="label">Policy</span>
        <h1 className={s.h1}>Trademarks</h1>
        <p className={s.lede}>
          The code is MPL-2.0: use it, change it, ship it. The name is
          different. These rules keep &ldquo;Glassworks&rdquo; meaning the real
          thing.
        </p>
      </header>

      <section className={s.section}>
        <h2>What this covers</h2>
        <p>
          The name <b>Glassworks</b>, the name <b>Glassworks Kiln</b>, the
          frame-and-panes mark, and the <b>Built on Glassworks</b> badge.
        </p>
      </section>

      <section className={s.section}>
        <h2>Fine without asking</h2>
        <ul className={s.yes}>
          <li>
            Saying your product is built on, works with or is compatible with
            Glassworks, when it&rsquo;s true.
          </li>
          <li>
            Using the badge on a product that ships the Glassworks core. See the{" "}
            <Link href="/brand#badge">badge rules</Link>.
          </li>
          <li>Writing, talking or making videos about Glassworks.</li>
          <li>
            Sharing unmodified Glassworks builds under the Glassworks name.
          </li>
          <li>Linking to Glassworks with the mark, unchanged.</li>
        </ul>
      </section>

      <section className={s.section}>
        <h2>Ask first</h2>
        <ul className={s.ask}>
          <li>
            Product, company, app or domain names that contain
            &ldquo;Glassworks&rdquo;, such as &ldquo;Glassworks Pro&rdquo; or{" "}
            <code>glassworks-panels.com</code>.
          </li>
          <li>
            Using the mark anywhere other than the badge or a link to the
            project.
          </li>
          <li>Selling merchandise with the name or mark.</li>
        </ul>
      </section>

      <section className={s.section}>
        <h2>Don&rsquo;t</h2>
        <ul className={s.no}>
          <li>
            Ship a modified build as &ldquo;Glassworks&rdquo;. Give your fork
            its own name; you can say it&rsquo;s based on Glassworks.
          </li>
          <li>
            Suggest that the project endorses or certifies your product when it
            hasn&rsquo;t.
          </li>
          <li>
            Change the mark, or use names or logos that could be confused with
            it.
          </li>
        </ul>
      </section>

      <section className={s.section}>
        <h2>Asking</h2>
        <p>
          <a href={ASK}>Open an issue</a> describing what you want to do. Most
          requests get a yes.
        </p>
        <p className={s.small}>
          Home Assistant is a trademark of the Open Home Foundation. Glassworks
          isn&rsquo;t affiliated with it.
        </p>
      </section>
    </article>
  );
}
