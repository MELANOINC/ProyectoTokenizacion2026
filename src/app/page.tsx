import { Hero } from "@/components/landing/Hero";
import { SiteHeader } from "@/components/landing/SiteHeader";
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
    </main>
  );
}
