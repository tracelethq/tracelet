import { GlobalLoadingProvider } from "@/components/providers/global-loading-provider";
import { MainLayout } from "./_components/main-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalLoadingProvider>
      <MainLayout>{children}</MainLayout>
    </GlobalLoadingProvider>
  );
}
