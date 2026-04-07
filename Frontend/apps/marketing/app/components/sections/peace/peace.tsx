import { clx } from "@repo/ui/utilities";
import InfoBlock from "../../ui/sectionInfo-block/info-block";
import Card from "../../ui/card/card";
import Image from "next/image";
import styles from "./peace.module.css";
import {
  Analytics,
  CheckedBag,
  Icon,
  SmartSearch,
  Surfing,
} from "@repo/ui/icon";

const CARD_DATA = [
  {
    id: "search-and-booking",
    title: "Smart Search & Booking",
    description:
      "Our system and human experts do the heavy lifting to find and secure the absolute best routes and lowest fares for your journey.",
    icon: <Icon icon={SmartSearch} size={"xxl"} color={"secondaryGradient"} />,
  },
  {
    id: "complete-ssr",
    title: "Complete SSR Management",
    description:
      "We handle all your Special Service Requests, ensuring your meal preferences, seat selection, and extra baggage are perfectly organized before you fly.",
    icon: <Icon icon={CheckedBag} size={"xxl"} color={"secondaryGradient"} />,
  },
  {
    id: "zero-hassle",
    title: "Zero-Hassle Modifications",
    description:
      "If your plans change, we manage all cancellations and rescheduling on your behalf without charging any extra internal processing fees.",
    icon: <Icon icon={Surfing} size={"xxl"} color={"secondaryGradient"} />,
  },
  {
    id: "jetrav-dashboard-access",
    title: "Jetrav Dashboard Access",
    description:
      "Log in to your personal web app to track active bookings, download tickets, and watch your 10% Jetpoints balance grow in real-time.",
    icon: <Icon icon={Analytics} size={"xxl"} color={"secondaryGradient"} />,
  },
];

export default function Token() {
  return (
    <section id={"why-jetrav"} className={clx("section-margin")}>
      <div className={clx("container")}>
        <div>
          <InfoBlock
            contentClassName={clx("items-center", "text-center")}
            icon={
              <Image
                src={"/img-peace.png"}
                alt={"Peace"}
                width={160}
                height={160}
                sizes={"100vw"}
              />
            }
            title={"One Fee. Total Peace of Mind."}
            description={
              "The Flat ₹199 Promise: For a flat service charge of ₹199, Jetrav becomes\n" +
              "your travel concierge. This fee covers:"
            }
          />
        </div>
        <div
          className={clx(
            "grid",
            "grid-cols-4",
            "md-grid-cols-2",
            "sm-grid-cols-1",
            "gap-4",
            "mt-12",
            styles.grid,
          )}
        >
          {CARD_DATA.map((card) => (
            <Card
              key={card.id}
              icon={card.icon}
              title={card.title}
              description={card.description}
              contentClassName={clx("px-4", "mt-4", "mb-4")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
