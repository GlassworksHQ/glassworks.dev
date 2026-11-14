import Link from "next/link";
import { Mark } from "./Mark";
import { links } from "@/lib/site";
import styles from "./chrome.module.css";

export function SiteFooter() {
  return (
    <footer className={`wrap ${styles.footer}`}>
      <div className={styles.footTop}>
        <Link href="/" className={styles.home}>
          <Mark cut="small" className={styles.markSm} />
          <span className={styles.wordSm}>Glassworks</span>
        </Link>
        <nav className={styles.footNav} aria-label="Footer">
          <Link href="/frames">Devices</Link>
          <Link href="/panes">Panes</Link>
          <Link href="/brand">Brand</Link>
          <Link href="/trademarks">Trademarks</Link>
          <a href={links.org}>GitHub</a>
          <a href={links.s1}>Source</a>
          <a href={links.contact}>Contact</a>
        </nav>
      </div>
      <p className={styles.legal}>
        Home Assistant is a trademark of the Open Home Foundation. Glassworks
        isn&rsquo;t affiliated with it.
      </p>
    </footer>
  );
}
