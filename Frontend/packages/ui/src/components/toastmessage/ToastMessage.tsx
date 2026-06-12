'use client';

import React from 'react';
import styles from './style.module.css';

export interface ToastMessageProps {
  title?: string;
  description: string;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({ title, description }) => {
  return (
    <div className={styles.toasterWrapper}>
      {title && <h3 className={styles.toasterHeader}>{title}</h3>}
      <p className={styles.toasterDesc}>{description}</p>
    </div>
  );
};
