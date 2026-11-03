'use client';

import Link from 'next/link';
import { clx } from '@repo/ui/utilities';
import styles from './header.module.css';
import '@repo/ui/styles/css/utilities.css';
import '@repo/ui/styles/css/base.css';
import { Logo } from '@repo/ui/components/logo/logo';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button/button';
import { useEffect, useState } from 'react';
import { ROUTES } from '@repo/constants';

const NAV_LINKS = [
  { label: ROUTES.marketing.home.label, href: ROUTES.marketing.home.href },
  {
    label: ROUTES.marketing.jetPoints.label,
    href: ROUTES.marketing.jetPoints.href,
  },
  {
    label: ROUTES.marketing.whyJetrav.label,
    href: ROUTES.marketing.whyJetrav.href,
  },
  {
    label: ROUTES.marketing.solutions.label,
    href: ROUTES.marketing.solutions.href,
  },
  {
    label: ROUTES.marketing.contact.label,
    href: ROUTES.marketing.contact.href,
  },
];

function Header() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Batch scroll updates to one per frame so scrolling stays smooth
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setIsScrolled(window.scrollY > 10);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Hide the header as soon as the footer section enters the screen
    const footerSection = document.getElementById('footer');
    const observer = footerSection
      ? new IntersectionObserver(([entry]) => setIsHidden(entry?.isIntersecting ?? false))
      : null;
    if (footerSection) observer?.observe(footerSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return (
    <header
      className={clx(
        styles.headerMain,
        isScrolled && ['container', 'px-8', styles.scroll],
        isHidden && [styles.isHidden],
      )}
    >
      <div
        className={clx(
          styles.headerContainer,
          'flex',
          isScrolled ? '' : 'container',
          'justify-between',
          'items-center',
          'py-4',
        )}
      >
        <Link href="/home" aria-label="Jetrav home">
          <Logo className={styles.logoSize} />
        </Link>
        <nav aria-label="Main">
          <ul className={`flex gap-4`}>
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <li key={href} className={clx('flex', 'items-center', 'glowHover')}>
                  <Link
                    href={href}
                    className={clx(pathname === href)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={clx('flex', 'items-center', 'gap-2')}>
          <Button
            className={clx('flex', 'items-center', 'px-4', 'py-2', 'gap-1')}
            variant={'navSecondary'}
            href={ROUTES.publicApp.login.href}
            target={'_blank'}
          >
            {ROUTES.publicApp.login.label}
          </Button>
          <Button
            className={clx('flex', 'items-center', 'px-4', 'py-2', 'gap-1')}
            variant={'navPrimary'}
            href={ROUTES.publicApp.register.href}
          >
            {ROUTES.publicApp.register.label}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
