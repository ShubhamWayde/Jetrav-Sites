import { clx } from '@repo/ui/utilities';
import styles from './info-block.module.css';

export interface InfoBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export default function InfoBlock({
  icon,
  title,
  description,
  contentClassName,
  children,
  ...props
}: InfoBlockProps) {
  const hasContent = icon || title || description || children;
  if (!hasContent) return null;
  return (
    <div className={clx('flex', 'flex-col', 'gap-3', contentClassName)} {...props}>
      {icon}
      {title && <h3 className={clx(styles.heading)}>{title}</h3>}
      {description && <p className={clx(styles.description, 'paragraph')}>{description}</p>}
      {children}
    </div>
  );
}
