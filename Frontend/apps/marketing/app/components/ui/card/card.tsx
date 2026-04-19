'use client';

import { clx } from '@repo/ui/utilities';
import React, { useRef } from 'react';
import styles from './card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  image?: React.ReactNode;
  heading: React.ReactNode | string;
  description?: string;
  price?: string;
  tagName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export default function Card({
  icon,
  image,
  heading,
  description,
  price,
  tagName,
  contentClassName,
  children,
  ...props
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} className={clx(styles.card, 'p-4')} {...props}>
      <div>
        {image && <div className={clx(styles.imageWrapper, 'flex')}>{image}</div>}
        {tagName && (
          <span className={clx(styles.tagName, 'flex', 'px-4', 'py-2', 'm-4')}>{tagName}</span>
        )}
        {icon && <div className={clx(styles.iconWrapper, 'flex', 'px-4', 'mt-4')}>{icon}</div>}
        <div className={clx(styles.cardContent, 'flex', 'flex-col', 'gap-1', contentClassName)}>
          {heading && typeof heading === 'string' ? <h3>{heading}</h3> : heading}
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
