import { Hero } from "@/components/landing/Hero";
import { LifecycleSection } from "@/components/landing/LifecycleSection";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <PlatformSection />
      <LifecycleSection />
      <SiteFooter />
    </main>
  );
}
