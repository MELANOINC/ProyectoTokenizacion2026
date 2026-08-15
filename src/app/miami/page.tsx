import type { Metadata } from "next";
import Link from "next/link";
import { MiamiPilotForm } from "@/components/miami/MiamiPilotForm";

export const metadata: Metadata = {
  title: "NOTORIUS Miami Founding Pilot | MELANO INC",
  description:
    "Private South Florida pilot for asset tokenization feasibility, smart-contract prototypes, testnet deployment and technical architecture by MELANO INC.",
};

const deliverables = [
  "Asset tokenization feasibility assessment",
  "Token / registry architecture recommendation",
  "Smart-contract MVP or technical specification",
  "Controlled testnet prototype when applicable",
  "Ownership and event traceability model",
  "Technical roadmap for a production candidate",
];

const fit = [
  "Real estate owners and developers",
  "Family offices and investment holding companies",
  "LLCs evaluating digital asset infrastructure",
  "Businesses with contractual or ownership workflows",
  "Asset owners exploring smart contracts before production",
];

export default function MiamiPilotPage() {
  return (
    <main className="min-h-screen bg-[#050506] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(201,169,110,0.18),transparent_35%),radial-gradient(circle_at_15%_70%,rgba(139,92,246,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <Link href="/" className="text-sm tracking-[0.18em] text-white/55 uppercase hover:text-white">MELANO INC / NOTORIUS</Link>
          <div className="mt-8 inline-flex rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#e1c48d] uppercase">South Florida · Private Pilot · 5 Spots</div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] md:text-7xl">Tokenize the asset before you tokenize the market.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">MELANO INC is selecting five South Florida companies, developers, family offices and asset owners to test NOTORIUS on one real-world asset or smart-contract use case.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/65">
            <span className="rounded-full border border-white/10 px-4 py-2">Private technical pilot</span>
            <span className="rounded-full border border-white/10 px-4 py-2">Testnet-first</span>
            <span className="rounded-full border border-white/10 px-4 py-2">No public token sale</span>
            <span className="rounded-full border border-white/10 px-4 py-2">No capital raise</span>
          </div>
          <a href="#apply" className="mt-9 inline-flex rounded-xl bg-[#c9a96e] px-6 py-3.5 font-semibold text-black transition hover:brightness-110">Apply for the Miami Pilot</a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#c9a96e] uppercase">What the pilot delivers</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">One asset. One controlled proof of concept.</h2>
          <p className="mt-5 leading-relaxed text-white/65">The objective is not to launch a public investment product. The pilot determines whether a selected asset or contractual workflow can be structured technically, documented clearly and demonstrated safely before a production decision.</p>
          <ul className="mt-8 space-y-3">
            {deliverables.map((item) => <li key={item} className="flex gap-3 text-white/80"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />{item}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:p-9">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#c9a96e] uppercase">Best fit</p>
          <h3 className="mt-3 text-2xl font-semibold">Who should apply</h3>
          <ul className="mt-6 space-y-4">
            {fit.map((item) => <li key={item} className="border-b border-white/10 pb-4 text-white/75 last:border-0">{item}</li>)}
          </ul>
          <div className="mt-7 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-relaxed text-white/55">If a future implementation involves ownership, debt, revenue share, investor rights, custody, securities or regulated activity, production requires appropriate legal/compliance review. Smart contracts require security review before mainnet use.</div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#c9a96e] uppercase">Pilot workflow</p>
          <div className="mt-7 grid gap-4 md:grid-cols-5">
            {["1. Apply", "2. Technical fit call", "3. Asset assessment", "4. Testnet / contract POC", "5. Production roadmap"].map((step) => <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm font-medium text-white/80">{step}</div>)}
          </div>
        </div>
      </section>

      <section id="apply" className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[0.85fr_1.15fr] md:px-10 md:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#c9a96e] uppercase">Founding Pilot</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Five South Florida cases.</h2>
          <p className="mt-5 leading-relaxed text-white/65">Tell us what asset or smart-contract use case you want to validate. The application goes directly into MELANO INC's operating CRM for review and qualification.</p>
          <div className="mt-7 space-y-2 text-sm text-white/55">
            <p>MELANO INC — AI. Automation. Impact.</p>
            <p>Bruno Melano — CEO & Founder</p>
          </div>
        </div>
        <MiamiPilotForm />
      </section>
    </main>
  );
}
