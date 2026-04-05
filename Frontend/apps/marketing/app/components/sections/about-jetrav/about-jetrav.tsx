import {TextReveal} from "../../text-reveal/text-reveal";
import styles from "./about-jetrav.module.css"
import {clx} from "@repo/ui/utilities";

export default function AboutJetrav() {
  return (
    <section>
      <div className={clx("container")}>
        <TextReveal className={styles.text}
                    text={"At Jetrav, we believe travel should be rewarding and stress-free. We aren't just a booking engine; we are your personal travel partners. From securing your visa to booking your flight and ensuring you have the right insurance, we handle it all."} />
      </div>
    </section>
  )
}