import Card, { CardProps } from '../card/card';
import { clx } from '@repo/ui/utilities';
import styles from './trip-card.module.css';
import React from 'react';
import { Hexagon, Icon, Star } from '@repo/ui/icon';
import { fontRoboto } from '@repo/ui/fonts/fonts';

export type TripHighLight = {
  icon: React.ReactNode;
  label: string;
};

export type TripFeature = {
  icon: React.ReactNode;
  label: string;
};

interface TripCardProps extends Omit<CardProps, 'heading'> {
  tripHeading: string;
  days: number;
  nights: number;
  locations: string[];
  rating?: number;
  price?: string;
  highLights: TripHighLight[];
  features: TripFeature[];
  itineraryLink: string;
}
export default function TripCard({
  tripHeading,
  nights,
  days,
  locations,
  rating,
  price,
  highLights,
  features,
  itineraryLink,
  ...props
}: TripCardProps) {
  return (
    <Card
      {...props}
      heading={
        <div>
          <div className={clx('flex', 'justify-between', 'items-center')}>
            <h3>{tripHeading}</h3>
            <React.Fragment>
              <p className={clx(styles.dayNight, 'gradientBox', 'px-4', 'p-1')}>
                {nights}N / {days}D
              </p>
            </React.Fragment>
          </div>
          <div className={clx('flex', 'gap-2', 'items-center')}>
            {locations?.map((location, index) => (
              <React.Fragment key={index}>
                <p>{location}</p>
                {index < locations.length - 1 && (
                  <Icon icon={Hexagon} size={'xxs'} color={'secondaryGradient'} />
                )}
              </React.Fragment>
            ))}
            {rating && (
              <div className={clx(styles.rating, 'flex')}>
                {Array.from({ length: rating }).map((_, index) => (
                  <Icon key={index} icon={Star} size={'lg'} color={'secondaryGradient'} />
                ))}
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className={clx(styles.highLight, 'flex', 'gap-3', 'p-4')}>
        {highLights?.map((highlight, index) => (
          <div className={clx('flex')} key={index} title={highlight.label}>
            {highlight.icon}
          </div>
        ))}
      </div>

      <div className={clx('grid', 'grid-cols-2', 'sm-grid-cols-1', 'gap-2', 'p-4', 'mb-2')}>
        {features?.map((feature, index) => (
          <div className={clx('flex', 'gap-3', 'items-center')} key={index}>
            {feature.icon}
            <p className={clx(styles.featureLabel)}>{feature.label}</p>
          </div>
        ))}
      </div>

      <div className={clx(styles.priceContainer, fontRoboto.className)}>
        <div
          className={clx(
            fontRoboto.className,
            'flex',
            'items-center',
            'px-6',
            'py-2',
            'gap-1',
            'md-fg-1',
            'gradientBox',
            'justify-between',
          )}
        >
          {price}
          {/*<Link className={fontOutfit.className} href={itineraryLink} target={'_blank'}>*/}
          {/*  View Itinerary*/}
          {/*</Link>*/}
        </div>
      </div>
    </Card>
  );
}
