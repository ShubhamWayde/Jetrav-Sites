import AppShell from '@/components/layout/app-layout/AppShell';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
