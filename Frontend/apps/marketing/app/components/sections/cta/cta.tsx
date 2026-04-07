import { clx } from "@repo/ui/utilities";
import InfoBlock from "../../ui/sectionInfo-block/info-block";
import Image from "next/image";
import styles from "./cta.module.css";
import { fontRoboto } from "@repo/ui/fonts/fonts";
import { Button } from "../../ui/button/button";
import { CarryOnBagChecked, Icon } from "@repo/ui/icon";
import { ROUTES } from "@repo/constants";

export default function Cta() {
  return (
    <section id={"contact"} className={"section-margin"}>
      <div className={"container"}>
        <div className={styles.ctaWrapper}>
          <InfoBlock
            contentClassName={clx("items-center", "text-center", "p-20")}
            icon={
              <Image
                src={"/jt-tag.png"}
                alt={"comprehensive solutions"}
                width={188}
                height={72}
                sizes={"100vw"}
              />
            }
            title={"Stop Searching. Start Traveling."}
            description={
              "Hand over the endless tabs, complex routing, and visa paperwork to India’s smartest travel platform. Your personal concierge is ready."
            }
          >
            <div className={clx("flex", "flex-wrap")}>
              <Button
                href={ROUTES.marketing.phoneNumber.href}
                className={clx(
                  "flex",
                  "items-center",
                  "px-4",
                  "py-2",
                  "gap-1",
                  "md-fg-1",
                )}
              >
                <Icon
                  icon={CarryOnBagChecked}
                  size={"lg"}
                  color={"primaryGradient"}
                />
                {ROUTES.marketing.phoneNumber.label}
              </Button>
              <Button
                className={clx(
                  fontRoboto.className,
                  "flex",
                  "items-center",
                  "px-4",
                  "py-2",
                  "gap-1",
                  "md-fg-1",
                  styles.btnDark,
                )}
                variant={"secondary"}
              >
                <em>Dial. Done. Depart.</em>
              </Button>
            </div>
            <p className={clx(styles.ctaParagraph, "mt-8")}>
              Connect with an expert. No forms required.
            </p>
          </InfoBlock>
        </div>
      </div>
    </section>
  );
}
