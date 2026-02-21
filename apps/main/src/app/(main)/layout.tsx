import { MainLayout } from "./_components/main-layout";
import { MainShell } from "./_components/main-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <MainShell>{children}</MainShell>
    </MainLayout>
  );
}
