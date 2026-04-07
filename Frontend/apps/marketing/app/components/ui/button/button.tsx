import React from "react";
import { clx } from "@repo/ui/utilities";
import styles from "./button.module.css";
import { fontOutfit } from "@repo/ui/fonts/fonts";
import Link from "next/link";

type LinkProps = React.ComponentPropsWithoutRef<typeof Link>;

export interface BaseButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "gradient"
    | "navPrimary"
    | "navSecondary";
  icon?: React.ReactNode;
  disabled?: boolean;
}

type AsButtonProps = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: never;
  };

export type AsAnchorProps = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> &
  LinkProps & {
    href: string;
  };

export type ButtonPropsWithAs = AsButtonProps | AsAnchorProps;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonPropsWithAs
>((props, ref) => {
  const {
    children,
    variant = "primary",
    icon,
    className,
    disabled,
    ...rest
  } = props;

  const combinedClassName = clx(
    fontOutfit.className,
    styles.btn,
    styles[variant],
    className,
  );

  const innerContent = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}

      {children}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkProps } = rest as Omit<
      AsAnchorProps,
      keyof BaseButtonProps
    >;
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={combinedClassName}
        {...linkProps}
      >
        {innerContent}
      </Link>
    );
  }

  const buttonProps = rest as Omit<AsButtonProps, keyof BaseButtonProps>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={disabled}
      aria-disabled={disabled}
      className={combinedClassName}
      {...buttonProps}
    >
      {innerContent}
    </button>
  );
});

Button.displayName = "Button";
