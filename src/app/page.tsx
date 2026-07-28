import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { Hero } from "@/components/landing/Hero";
import { LifecycleSection } from "@/components/landing/LifecycleSection";
import { Marquee } from "@/components/landing/Marquee";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function Home() {
  return (
    <main>
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
