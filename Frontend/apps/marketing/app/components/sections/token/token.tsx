import { clx } from "@repo/ui/utilities";
import InfoBlock from "../../ui/sectionInfo-block/info-block";
import Card from "../../ui/card/card";
import Image from "next/image";
import styles from "./token.module.css";

const PRICE = 1000;
const formattedPrice = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(PRICE);

const CARD_DATA = [
  {
    id: "the-guarantee",
    title: "The 15% Guarantee",
    description: `For every ${formattedPrice} you spend on flights, your digital wallet is credited with ${(PRICE * 15) / 100} Jet Points.`,
    image: "/img-the-guarantee.png",
    imageAlt: "Guarantee",
  },
  {
    id: "simple-math",
    title: "Simple Math",
    description: "5 Jet Point = ₹1.",
    image: "/img-simple-math.png",
    imageAlt: "Simple Math",
  },
  {
    id: "instant-utility",
    title: "Instant Utility",
    description:
      "Track your growing balance on your Jetrav Dashboard and redeem them seamlessly on your next flight, hotel, or visa booking.",
    image: "/img-instant-utility.png",
    imageAlt: "No Middleman",
  },
];

export default function Token() {
  return (
    <section id={"jet-points"} className={clx("section-margin")}>
      <div className={clx("container")}>
        <div>
          <InfoBlock
            contentClassName={clx("items-center", "text-center")}
            icon={
              <Image
                src={"/img-token.png"}
                alt={"Token"}
                width={160}
                height={160}
                sizes={"100vw"}
              />
            }
            title={"A Tokenized Travel Economy."}
            description={
              "We replaced hidden middleman commissions with a dynamic reward ledger.\n" +
              "Every trip funds your next trip."
            }
          />
        </div>
        <div
          className={clx(
            styles.grid,
            "grid",
            "grid-cols-3",
            "md-grid-cols-2",
            "sm-grid-cols-1",
            "gap-4",
            "mt-12",
          )}
        >
          {CARD_DATA.map((card) => (
            <Card
              key={card.id}
              image={
                <Image
                  className={styles.imgBackground}
                  src={card.image}
                  alt={card.imageAlt}
                  width={480}
                  height={220}
                  sizes={"100vw"}
                />
              }
              title={card.title}
              description={card.description}
              contentClassName={clx("text-center", "gap-1", "p-6")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
