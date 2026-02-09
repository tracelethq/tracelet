import { Hero } from "./_components/hero"
import { ProductShowcase } from "./_components/product-showcase"
import { WhyChooseTracelet } from "./_components/why-choose-tracelet"
import { ProblemSection } from "./_components/problem-section"
import { WhatIsTracelet } from "./_components/what-is-tracelet"
import { HowItWorks } from "./_components/how-it-works"
import { ThreeCapabilities } from "./_components/three-capabilities"
import { DesignedFor } from "./_components/designed-for"
import { UseCases } from "./_components/use-cases"
import { Architecture } from "./_components/architecture"
import { Philosophy } from "./_components/philosophy"
import { FinalCta } from "./_components/final-cta"
import { LandingFooter } from "./_components/landing-footer"

export default function LandingRoute() {
  return (
    <>
      <Hero />
      <ProductShowcase />
      <WhyChooseTracelet />
      <ProblemSection />
      <WhatIsTracelet />
      <HowItWorks />
      <ThreeCapabilities />
      <DesignedFor />
      <UseCases />
      <Architecture />
      <Philosophy />
      <FinalCta />
      <LandingFooter />
    </>
  )
}
