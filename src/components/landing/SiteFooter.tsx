import Image from "next/image";
import Link from "next/link";
import { CTA } from "@/lib/cta";
import { ECOSYSTEM } from "@/lib/ecosystem";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--s1)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="flex items-start gap-3">
          <Image
            src="/melano-mark.svg"
            alt="Melano Inc"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--w)]">
              MELANO INC
            </p>
            <p className="mt-1 max-w-md text-[var(--w2)]">
              aLENYA capta · LUXIA convierte · NOTORIUS tokeniza
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--g1)]">
          <Link href="/precios" className="hover:text-[var(--gold)]">
            Precios
          </Link>
          <Link href="/comprar" className="hover:text-[var(--gold)]">
            Comprar
          </Link>
          <a
            href={CTA.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--gold)]"
          >
            Agendar diagnóstico
          </a>
          <a
            href={ECOSYSTEM.alenya.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--gold)]"
          >
            aLENYA
          </a>
          <a
            href={ECOSYSTEM.luxia.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--gold)]"
          >
            LUXIA
          </a>
          <Link href="/dashboard/contratos" className="hover:text-[var(--gold)]">
            NOTORIUS
          </Link>
          <Link href="/docs" className="hover:text-[var(--gold)]">
            Docs
          </Link>
          <Link href="/admin/login" className="hover:text-[var(--gold)]">
            Acceso interno
          </Link>
        </div>
      </div>
    </footer>
  );
}
