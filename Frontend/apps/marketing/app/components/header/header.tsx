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

function header() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      const footerSection = document.getElementById('footer');
      if (footerSection) {
        // 3. Hide the header as soon as the footer section enters the screen
        const sectionTop = footerSection.getBoundingClientRect().top;
        setIsHidden(sectionTop <= window.innerHeight);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
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
        <Link href="/home" area-label="Home">
          <Logo className={styles.logoSize} />
        </Link>
        <nav>
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

export default header;
