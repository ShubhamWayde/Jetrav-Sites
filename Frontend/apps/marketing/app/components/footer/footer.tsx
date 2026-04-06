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

const FOOTER_LINKS = [
  {
    id: "quick-links",
    title: "Quick Links",
    links: [
      {
        label: ROUTES.marketing.solutions.label,
        href: ROUTES.marketing.solutions.href,
        icon: <Icon icon={YourTrips} size={"lg"} color={"secondaryGradient"} />
      },
      {
        label: ROUTES.marketing.whyJetrav.label,
        href: ROUTES.marketing.whyJetrav.href,
        icon: <Icon icon={JetravIconOutline} size={"lg"} color={"secondaryGradient"} />
      },
      {
        label: ROUTES.marketing.jetPoints.label,
        href: ROUTES.marketing.jetPoints.href,
        icon: <Icon icon={JetPoints} size={"lg"} color={"secondaryGradient"} />
      },
    ]
  },
  {
    id: "jetrav-section",
    title: "Jetrav",
    links: [
      {
        label: ROUTES.publicApp.login.label,
        href: ROUTES.publicApp.login.href,
        icon: <Icon icon={Login} size={"lg"} color={"secondaryGradient"} />
      },
      {
        label: ROUTES.publicApp.register.label,
        href: ROUTES.publicApp.register.href,
        icon: <Icon icon={Registration} size={"lg"} color={"secondaryGradient"} />
      },
      {
        label: "Track Booking",
        href: "/track-booking",
        icon: <Icon icon={TrackBooking} size={"lg"} color={"secondaryGradient"} />
      },
    ]
  },
  {
    id: "contact-section",
    title: "Contact Us",
    links: [
      {
        label: ROUTES.marketing.phoneNumber.label,
        href: ROUTES.marketing.phoneNumber.href,
        icon: <Icon icon={Call} size={"lg"} color={"secondaryGradient"} />
      },
      {
        label: ROUTES.marketing.email.label,
        href: ROUTES.marketing.email.href,
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
                    href={"https://x.com/jetravhq"}><Icon icon={XTwitter}
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
                        <Link href={link.href} className={clx("flex", "gap-2", "items-center")}>
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