import {clx} from "@repo/ui/utilities";
import InfoBlock from "../../ui/sectionInfo-block/info-block";
import Image from "next/image"
import CircuitGrid from "../../ui/circuit-grid/circuit-grid"
import {
  AirplaneTicket,
  CheckedBag,
  CurrencyExchange,
  Holiday,
  Hotel,
  Icon,
  Insurance,
  Taxi,
  TrainTicket,
  Visa
} from "@repo/ui/icon";

const DATA = [
  {
    id: '1',
    icon: <Icon icon={AirplaneTicket} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Air Tickets',
    description: 'Domestic and International flights with maximum reward points.'
  },
  {
    id: '2',
    icon: <Icon icon={Hotel} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Hotels',
    description: 'From budget stays to luxury suites, tailored to your preference.'
  },
  {
    id: '3',
    icon: <Icon icon={Visa} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Visas',
    description: 'Hassle-free documentation and processing assistance.'
  },
  {
    id: '4',
    icon: <Icon icon={Insurance} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Travel Insurance',
    description: 'Comprehensive coverage for peace of mind.'
  },
  {
    id: '5',
    icon: <Icon icon={TrainTicket} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Train & Bus Tickets',
    description: 'Seamless ground transportation booking.'
  },
  {
    id: '6',
    icon: <Icon icon={Taxi} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Car/Taxi Services',
    description: 'Airport transfers and local rentals.'
  },
  {
    id: '7',
    icon: <Icon icon={CurrencyExchange} size={"xxl"} color={"secondaryGradient"} />,
    title: ' Forex Exchange',
    description: 'Competitive rates for your currency needs.'
  },
  {
    id: '8',
    icon: <Icon icon={Holiday} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Holiday Packages',
    description: 'Customized itineraries for families, couples, and solo travelers.'
  },
  {
    id: '9',
    icon: <Icon icon={CheckedBag} size={"xxl"} color={"secondaryGradient"} />,
    title: 'Specials SSR (Special Service Requests)',
    description: 'Need a wheelchair, extra baggage, or a special meal? We ensure the airline knows before you fly.'
  },
];

export default function Solutions() {
  return (
    <section id={"solutions"} className={clx("section-margin")}>
      <div className={clx("container")}>
        <div>
          <InfoBlock contentClassName={clx("items-center", "text-center")} icon={
            <Image src={"/img-solutions.png"} alt={"comprehensive solutions"} width={160} height={160} sizes="100vw" />
          } title={"Comprehensive Travel Solutions."}
                     description={"We don't just book tickets; we curate experiences.\n" +
                       "Call us, and our team handles the rest."} />
        </div>
        <CircuitGrid items={DATA} />
      </div>
    </section>
  )
}