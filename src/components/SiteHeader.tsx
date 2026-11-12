import Link from "next/link";
import { Mark } from "./Mark";
import { GitHubGlyph } from "./Glyphs";
import { links } from "@/lib/site";
import styles from "./chrome.module.css";

export function SiteHeader() {
  return (
    <header className={`wrap ${styles.header}`}>
      <Link href="/" className={styles.home}>
        <Mark cut="small" className={styles.mark} />
        <span className={styles.word}>Glassworks</span>
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/frames">Devices</Link>
        <Link href="/panes">Panes</Link>
        <Link href="/brand">Brand</Link>
        <a href={links.org} className={styles.gh} aria-label="GitHub">
          <GitHubGlyph className={styles.ghIcon} />
          <span className={styles.ghText}>GitHub</span>
        </a>
      </nav>
    </header>
  );
}
