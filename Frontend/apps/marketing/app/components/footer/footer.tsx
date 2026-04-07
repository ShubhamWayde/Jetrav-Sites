import styles from "./footer.module.css"
import {clx} from "@repo/ui/utilities";
import {Logo} from "@repo/ui/components/logo/logo";
import Link from "next/link"
import GlowingLogo from "../ui/glowing-logo/glowing-logo";
import {
  Call,
  Email,
  Icon,
  Instagram,
  JetPoints,
  JetravIconOutline,
  Login,
  Registration,
  TrackBooking,
  XTwitter,
  YourTrips
} from "@repo/ui/icon";
import {ROUTES} from "@repo/constants";

type NavItem = {
  label: string;
  href: string;
  target?: string;
  icon?: React.ReactNode;
}

type FooterSection = {
  id: string;
  title: string;
  links: NavItem[];
}

const FOOTER_LINKS: FooterSection[] = [
  {
    id: "quick-links",
    title: "Quick Links",
    links: [
      {
        ...ROUTES.marketing.solutions,
        icon: <Icon icon={YourTrips} size={"lg"} color={"secondaryGradient"} />
      },
      {
        ...ROUTES.marketing.whyJetrav,
        icon: <Icon icon={JetravIconOutline} size={"lg"} color={"secondaryGradient"} />
      },
      {
        ...ROUTES.marketing.jetPoints,
        icon: <Icon icon={JetPoints} size={"lg"} color={"secondaryGradient"} />
      },
    ]
  },
  {
    id: "jetrav-section",
    title: "Jetrav",
    links: [
      {
        ...ROUTES.publicApp.login,
        icon: <Icon icon={Login} size={"lg"} color={"secondaryGradient"} />
      },
      {
        ...ROUTES.publicApp.register,
        icon: <Icon icon={Registration} size={"lg"} color={"secondaryGradient"} />
      },
      {
        ...ROUTES.publicApp.trackBooking,
        icon: <Icon icon={TrackBooking} size={"lg"} color={"secondaryGradient"} />
      },
    ]
  },
  {
    id: "contact-section",
    title: "Contact Us",
    links: [
      {
        ...ROUTES.marketing.phoneNumber,
        icon: <Icon icon={Call} size={"lg"} color={"secondaryGradient"} />
      },
      {
        ...ROUTES.marketing.email,
        icon: <Icon icon={Email} size={"lg"} color={"secondaryGradient"} />
      },
    ]
  }
]

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer id={"footer"} className={styles.footerMain}>
      <div className={clx("container")}>
        <div className={clx(styles.footerWrapper, "grid", "grid-cols-2", "sm-grid-cols-1")}>
          <div className={clx(styles.aboutCompany, "flex", "flex-col", "justify-between")}>
            <div className={clx("flex", "flex-col", "gap-4")}>
              <Logo />
              <p>— Jet. Set. Travel.</p>
            </div>
            <div className={clx(styles.socialLinks, "flex", "gap-3", "items-center")}>
              <Link className={clx("flex", "items-center", "justify-center", "p-2", "glowHover")}
                    href={"https://www.instagram.com/jetravhq/"} target={"_blank"}><Icon icon={Instagram}
                                                                                         size={"lg"}
                                                                                         color={"secondaryGradient"} />
              </Link>
              <Link className={clx("flex", "items-center", "justify-center", "p-2", "glowHover")}
                    href={"https://x.com/jetravhq"} target={"_blank"}><Icon icon={XTwitter}
                                                                            size={"lg"}
                                                                            color={"secondaryGradient"} />
              </Link>
              {/*<Link className={clx("flex", "items-center", "justify-center", "p-2", "glowHover")}*/}
              {/*      href={"/"}><Icon icon={Discord}*/}
              {/*                       size={"lg"}*/}
              {/*                       color={"secondaryGradient"} />*/}
              {/*</Link>*/}
            </div>
          </div>
          <div className={clx(styles.footerLinks)}>
            <div className={clx("grid", "grid-cols-3", "sm-grid-cols-1", "gap-6")}>
              {FOOTER_LINKS.map((section) => (
                <div key={section.id} className={clx("flex", "flex-col", "gap-4")}>
                  <h4>{section.title}</h4>
                  <ul className={clx("flex", "flex-col", "gap-3")}>
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} target={link.target} className={clx("flex", "gap-2", "items-center")}>
                          {link.icon}
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={clx(styles.terms, "flex", "justify-between", "px-8", "py-6", "mt-12")}>
          <p>Copyright © {currentYear} Jetrav LLP. All rights reserved.</p>
          {/*<div className={clx("flex", "gap-6")}>*/}
          {/*  <Link href="/">Terms & Conditions</Link>*/}
          {/*  <Link href="/">Privacy Policy</Link>*/}
          {/*</div>*/}
        </div>
      </div>
      <GlowingLogo className={clx(styles.width, "p-20")} />
    </footer>

  );
}

export default Footer;