"use client"

import Link from "next/link";
import {clx} from "@repo/ui/utilities";
import styles from "./header.module.css";
import "@repo/ui/styles/css/utilities.css"
import "@repo/ui/styles/css/base.css"
import {Logo} from "@repo/ui/components/logo/logo";

function header() {
  return (
    <header>
      <div className={clx(styles.header, "flex", "container", "justify-between")}>
        <div>
          <Link href="/" area-label="Home">
            {/*<li><Link href="/home">Jetrav</Link></li>*/}
            <Logo className={styles.logoSize} />
          </Link>
        </div>
        <nav>
          <ul className={`flex gap-4`}>
            <li><Link href="/login">Services</Link></li>
            <li><Link href="/register">Jet-points</Link></li>
            <li><Link href="/">Our story</Link></li>
            <li><Link href="/">Contact us</Link></li>
          </ul>
        </nav>
        <div>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </div>
    </header>
  );
}

export default header;