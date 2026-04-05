import {clx} from "@repo/ui/utilities";
import styles from "./hero.module.css";
import {fontRoboto} from "@repo/ui/fonts/fonts";
import {Button} from "../../ui/button/button";
import {Icon} from "@repo/ui/icons/icon";
import {CarryOnBagChecked, CurrencyRupeeCircle, FlightTakeoff, HumanAi, Workspaces} from "@repo/ui/icons";
import {ROUTES} from "@repo/constants";

export default function Hero() {
  return (
    <section className={clx("section-margin")}>
      <div className={clx("container")}>
        <div className={clx("flex", "flex-col", "gap-8")}>
          <div className={clx(styles.tag, "flex", "items-center", "gap-2", "py-2")}>
            <Button className={clx(fontRoboto.className, "flex", "items-center", "px-4", "py-2", "gap-1")}
                    variant={"secondary"}>
              Powered By Human + AI
              <Icon
                icon={HumanAi}
                size={"lg"} color={"secondary"} />
            </Button>

          </div>
          <div className={clx(styles.headingWrapper, "flex", "flex-col", "gap-4")}>
            <h1 className={clx(fontRoboto.className)}><span className={clx(styles.heroIconWrapper, "inline-flex", "item-center", "gap-6")}>Travel Seamlessly <Icon
              icon={FlightTakeoff}
              color={"secondary"}
              className={styles.heroIcon} /></span>
              <span className={clx(styles.heroIconWrapper, "inline-flex", "item-center", "gap-6")}>Earn
                 Instantly<Icon
                  icon={CurrencyRupeeCircle}
                  color={"secondary"}
                  className={styles.heroIcon} /></span>
              <span className={clx(styles.heroIconWrapper, "inline-flex", "item-center", "gap-6")}>Manage
                                                           Effortlessly <Icon
                  icon={Workspaces}
                  color={"secondary"}
                  className={styles.heroIcon} /></span>
            </h1>
            <p className={clx("paragraph", "text-start")}>The only travel agency that gives you <em>15%</em> back in
                                                          Jet Points on
                                                          every flight
                                                          and manages your entire trip
                                                          starting at <em>₹199</em>.</p>
          </div>
          <div className={clx(styles.ctaWrapper, "flex")}>
            <Button className={clx("flex", "items-center", "px-4", "py-2", "gap-1")}
                    variant={"primary"} href={ROUTES.marketing.phoneNumber.href}>
              <Icon
                icon={CarryOnBagChecked}
                size={"lg"} color={"primaryGradient"} />
              {ROUTES.marketing.phoneNumber.label}</Button>
            <Button className={clx(fontRoboto.className, "flex", "items-center", "px-4", "py-2", "gap-1")}
                    variant={"secondary"}>
              <em>Dial. Done. Depart.</em>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}