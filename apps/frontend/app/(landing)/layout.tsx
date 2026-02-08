import { LandingHeader } from "./_components/landing-header"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
