import { GuideSection } from "@/components/landing/GuideSection";
import { Hero } from "@/components/landing/Hero";
import { LifecycleSection } from "@/components/landing/LifecycleSection";
import { Marquee } from "@/components/landing/Marquee";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { TrioStack } from "@/components/landing/TrioStack";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  faqJsonLd,
  organizationJsonLd,
  softwareJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export default function Home() {
  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={webPageJsonLd()} />
      <JsonLd data={softwareJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      <SiteHeader />
      <Hero />
      <Marquee />
      <TrioStack />
      <GuideSection />
      <PlatformSection />
      <LifecycleSection />
      <SiteFooter />
    </main>
  );
}
