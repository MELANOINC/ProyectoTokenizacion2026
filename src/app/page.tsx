import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { Hero } from "@/components/landing/Hero";
import { LifecycleSection } from "@/components/landing/LifecycleSection";
import { Marquee } from "@/components/landing/Marquee";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationJsonLd,
  softwareJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export default function Home() {
  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={softwareJsonLd()} />
      <SiteHeader />
      <Hero />
      <Marquee />
      <EcosystemSection />
      <PlatformSection />
      <LifecycleSection />
      <SiteFooter />
    </main>
  );
}
