import { clx } from '@repo/ui/utilities';
import Image from 'next/image';
import InfoBlock from '../../ui/sectionInfo-block/info-block';
import styles from './packages.module.css';
import TripCard from '../../ui/trip-card/trip-card';
import {
  AirplaneTicket,
  DinnerDining,
  HeartCheck,
  Hotel,
  Icon,
  Insurance,
  RoundTrip,
  SimCard,
  StarShine,
  Taxi,
  Visa,
} from '@repo/ui/icon';

const PACKAGE_DATA = [
  {
    id: 'the thailand smart-escape',
    title: 'The Thailand Smart-Escape',
    nights: 4,
    days: 5,
    location: ['2N Krabi', '2N Phuket'],
    rating: 4,
    tag: 'Optimized Routing - From Mumbai',
    image: '/img-thailand.png',
    imageAlt: 'Pileh cove is located close to Phuket, Thailand is is such a serene area.',
    link: '/',
    highlights: [
      {
        icon: <Icon icon={AirplaneTicket} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Round Trip Flight',
      },
      {
        icon: <Icon icon={DinnerDining} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Selected Meals',
      },
      {
        icon: <Icon icon={Hotel} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: 4 Night Stay',
      },
      {
        icon: <Icon icon={Taxi} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Airport Transfer',
      },
      {
        icon: <Icon icon={Insurance} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Insurance',
      },
      {
        icon: <Icon icon={SimCard} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Free SIM',
      },
    ],
    features: [
      {
        icon: <Icon icon={RoundTrip} size={'xl'} color={'secondaryGradient'} />,
        label: 'Round Trip Flight',
      },
      {
        icon: <Icon icon={StarShine} size={'xl'} color={'secondaryGradient'} />,
        label: '4 Star Hotel',
      },
      {
        icon: <Icon icon={Taxi} size={'xl'} color={'secondaryGradient'} />,
        label: 'Airport Transfer',
      },
      {
        icon: <Icon icon={Visa} size={'xl'} color={'secondaryGradient'} />,
        label: 'Phi Phi & Krabi 4 Island Tour',
      },
      {
        icon: <Icon icon={DinnerDining} size={'xl'} color={'secondaryGradient'} />,
        label: 'Selected Meals',
      },
      {
        icon: <Icon icon={HeartCheck} size={'xl'} color={'secondaryGradient'} />,
        label: 'Free SIM + Insurance',
      },
    ],
    price: '₹48,499 / Per Person',
  },
  {
    id: 'the bali',
    title: 'The Bali Smart-Escape',
    nights: 6,
    days: 7,
    location: ['4N Kuta', '2N Ubud'],
    rating: 5,
    tag: 'Trending Smart Package - From Delhi',
    image: '/img-bali.png',
    imageAlt:
      'Ulun Danu Beratan Temple, Danau Beratan, Candikuning, Kabupaten de Tabanan, Bali, Indonesia',
    link: '/',
    highlights: [
      {
        icon: <Icon icon={AirplaneTicket} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Round Trip Flight',
      },
      {
        icon: <Icon icon={DinnerDining} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Selected Meals',
      },
      {
        icon: <Icon icon={Hotel} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: 4 Night Stay',
      },
      {
        icon: <Icon icon={Taxi} size={'xl'} color={'secondaryGradient'} />,
        label: 'Included: Airport Transfer',
      },
    ],
    features: [
      {
        icon: <Icon icon={RoundTrip} size={'xl'} color={'secondaryGradient'} />,
        label: 'Round Trip Flight',
      },
      {
        icon: <Icon icon={StarShine} size={'xl'} color={'secondaryGradient'} />,
        label: '4 Star Hotel',
      },
      {
        icon: <Icon icon={Taxi} size={'xl'} color={'secondaryGradient'} />,
        label: 'Airport Transfer',
      },
      {
        icon: <Icon icon={Taxi} size={'xl'} color={'secondaryGradient'} />,
        label: 'Inter Hotel Transfer',
      },
      {
        icon: <Icon icon={Visa} size={'xl'} color={'secondaryGradient'} />,
        label: 'Selected Meals',
      },
      {
        icon: <Icon icon={Visa} size={'xl'} color={'secondaryGradient'} />,
        label: '4 Activities',
      },
    ],
    price: '₹68,449 / Per Person',
  },
];

export default function Packages() {
  return (
    <section>
      <div className={clx('container')}>
        <div>
          <InfoBlock
            contentClassName={clx('items-center', 'text-center')}
            icon={
              <Image
                src={'/img-packages.png'}
                alt={'comprehensive solutions'}
                width={160}
                height={160}
                sizes="100vw"
                loading={'eager'}
              />
            }
            title={'Smart Packages.'}
            description={
              "Don't settle for static itineraries. Our system dynamically bundles flights, stays, and experiences to find the perfect balance of cost and comfort."
            }
          />
        </div>
        <div
          className={clx(styles.grid, 'grid', 'grid-cols-2', 'md-grid-cols-1', 'gap-4', 'mt-12')}
        >
          {PACKAGE_DATA.map((card) => (
            <TripCard
              key={card.id}
              tagName={card.tag}
              image={
                <Image
                  className={styles.imgBackground}
                  src={card.image}
                  alt={card.imageAlt}
                  width={480}
                  height={280}
                  sizes={'100vw'}
                />
              }
              tripHeading={card.title}
              nights={card.nights}
              days={card.days}
              rating={card.rating}
              contentClassName={clx('gap-1', 'px-6', 'py-4')}
              price={card.price}
              highLights={card.highlights}
              features={card.features}
              locations={card.location}
              itineraryLink={card.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
