import { ComponentProps, ElementType } from 'react';
import { clx } from '@repo/ui/utilities';
import styles from './icon.module.css';

type IconSize = 'xxs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type IconColor =
  | 'primary'
  | 'primaryGradient'
  | 'secondary'
  | 'secondaryGradient'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'inherit';

interface IconProps extends Omit<ComponentProps<'svg'>, 'width' | 'height'> {
  icon: ElementType;
  size?: IconSize;
  color?: IconColor;
}

export function Icon({
  icon: SvgIcon,
  size = 'md',
  color = 'inherit',
  className,
  ...props
}: IconProps) {
  const sizeMap = {
    xxs: 10,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  const colorMap = {
    primary: styles.primary,
    primaryGradient: styles.primaryGradient,
    secondary: styles.secondary,
    secondaryGradient: styles.secondaryGradient,
    success: styles.success,
    danger: styles.danger,
    warning: styles.warning,
    info: styles.info,
    light: styles.light,
    dark: styles.dark,
    inherit: styles.inherit,
  };

  return (
    <SvgIcon
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={clx(styles.icon, colorMap[color], 'fs-0', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
