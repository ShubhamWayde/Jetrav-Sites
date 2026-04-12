import { clx } from '@repo/ui/utilities';
import Image from 'next/image';
import InfoBlock from '../../ui/sectionInfo-block/info-block';
import styles from './packages.module.css';
import Card from '../../ui/card/card';

const PACKAGE_DATA = [
  {
    id: 'the thailand smart-escape',
    title: 'The Thailand Smart-Escape (5N/6D)',
    description:
      'From Bangkok’s energy to Phuket’s calm shores. We use predictive algorithms to find the best flight times and lowest fares, so you enjoy a zero-friction getaway.',
    tag: 'Optimized Routing - From Mumbai',
    image: '/img-thailand.png',
    imageAlt: 'Pileh cove is located close to Phuket, Thailand is is such a serene area.',
    price: '₹48,499 / Per Person',
  },
  {
    id: 'the bali',
    title: 'The Bali Smart-Escape (6N/7D)',
    description:
      'Experience the Island of the Gods without the planning fatigue. Your dedicated concierge handles the visa probability checks, flight routing, and curated stays.',
    tag: 'Trending Smart Package - From Delhi',
    image: '/img-bali.png',
    imageAlt:
      'Ulun Danu Beratan Temple, Danau Beratan, Candikuning, Kabupaten de Tabanan, Bali, Indonesia',
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
              />
            }
            title={'Smart Packages.'}
            description={
              "Don't settle for static itineraries. Our system dynamically bundles flights, stays, and experiences to find the perfect balance of cost and comfort."
            }
          />
        </div>
        <div
          className={clx(styles.grid, 'grid', 'grid-cols-2', 'sm-grid-cols-1', 'gap-4', 'mt-12')}
        >
          {PACKAGE_DATA.map((card) => (
            <Card
              key={card.id}
              tagName={card.tag}
              image={
                <Image
                  className={styles.imgBackground}
                  src={card.image}
                  alt={card.imageAlt}
                  width={480}
                  height={480}
                  sizes={'100vw'}
                />
              }
              title={card.title}
              description={card.description}
              contentClassName={clx('gap-1', 'p-6')}
              price={card.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
