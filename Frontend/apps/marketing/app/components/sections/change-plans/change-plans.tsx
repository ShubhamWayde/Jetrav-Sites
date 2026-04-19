import { clx } from '@repo/ui/utilities';
import InfoBlock from '../../ui/sectionInfo-block/info-block';
import Card from '../../ui/card/card';
import Image from 'next/image';

const CARD_DATA = [
  {
    id: 'zero-fee',
    title: 'Zero Internal Change Fees',
    description:
      'We never charge an additional service fee to process your cancellations or modifications.',
    image: '/img-zero-fee.png',
    imageAlt: 'Guarantee',
  },
  {
    id: 'transparent-fare',
    title: 'Transparent Fare Adjustments',
    description:
      'You only pay the actual fare difference mandated by the airline, hotel, or operator.',
    image: '/img-fare-adjustments.png',
    imageAlt: 'Simple Math',
  },
];

export default function ChangePlans() {
  return (
    <section className={clx('section-margin')}>
      <div className={clx('container')}>
        <div>
          <InfoBlock
            title={'Change of Plans? No Problem.'}
            description={
              'Travel plans shift. When they do, our platform adapts without penalizing you. If you need to change your dates or cancel:'
            }
          />
        </div>
        <div className={clx('grid', 'grid-cols-2', 'sm-grid-cols-1', 'gap-4', 'mt-12')}>
          {CARD_DATA.map((card) => (
            <Card
              key={card.id}
              image={
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  width={480}
                  height={220}
                  sizes="100vw"
                />
              }
              heading={card.title}
              description={card.description}
              contentClassName={clx('text-center', 'gap-1', 'p-6')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
