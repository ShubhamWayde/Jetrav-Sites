import React from 'react';
import {clx} from "@repo/ui/utilities";
import styles from './circuit-grid.module.css';

export interface CircuitItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface CircuitGridProps {
  items: CircuitItem[];
  className?: string;
}

export default function CircuitGrid({items, className}: CircuitGridProps) {
  return (
    <div className={clx("grid", "grid-cols-4", "md-grid-cols-2", "sm-grid-cols-1", "mt-12", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={clx("p-8", styles.cell)}
          // We pass the index as a custom property so we can stagger animations later if we want!
          style={{'--index': index} as React.CSSProperties}
        >
          {item.icon}
          <div className={clx(styles.cardContent, "flex", "flex-col", "gap-1", "mt-3")}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.description}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}