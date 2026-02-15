import { Hero } from "./_components/hero"
import { FeatureShowcaseSection } from "./_components/feature-showcase-section"
import { WhyChooseTracelet } from "./_components/why-choose-tracelet"
import { WhatIsTracelet } from "./_components/what-is-tracelet"
import { HowItWorks } from "./_components/how-it-works"
import { DesignedFor } from "./_components/designed-for"
import { UseCasesAndArchitecture } from "./_components/use-cases-and-architecture"
import { Philosophy } from "./_components/philosophy"
import { FinalCta } from "./_components/final-cta"
import { LandingFooter } from "./_components/landing-footer"
import PatternDivider from "@/components/pattern-divider"

interface Section {
  component: React.ComponentType;
  hideDivider?: boolean;
  dividerSize?: number;
}

const sections: Section[] = [
  {
    component: Hero,
  },
  {
    component: FeatureShowcaseSection,
  },
  {
    component: WhyChooseTracelet,
  },
  {
    component: WhatIsTracelet,
    dividerSize: 4,
  },
  {
    component: HowItWorks,
  },
  {
    component: DesignedFor,
  },
  {
    component: UseCasesAndArchitecture,
  },
  {
    component: Philosophy,
    hideDivider: true,
  },
  {
    component: FinalCta,
    dividerSize: 4,
  },
  {
    component: LandingFooter,
  },
]

export default function LandingRoute() {
  return (
    <>
    {
      sections.map((section, index) => (
        <div key={index}>
          <section.component />
          {!section.hideDivider && index !== sections.length - 1 && <PatternDivider size={section.dividerSize} />}
        </div>
      ))
    }
    </>
  )
}
