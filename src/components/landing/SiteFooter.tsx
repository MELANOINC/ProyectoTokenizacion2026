import Image from "next/image";
import Link from "next/link";

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
              NOTORIUS
            </p>
            <p className="mt-1 max-w-md text-[var(--w2)]">
              Melano Inc · Smart Contract Engine + Tokenization Platform
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--g1)]">
          <Link href="/dashboard/contratos" className="hover:text-[var(--gold)]">
            Estudio
          </Link>
          <Link href="/dashboard" className="hover:text-[var(--gold)]">
            Dashboard
          </Link>
          <Link href="/docs" className="hover:text-[var(--gold)]">
            Docs
          </Link>
          <a
            href="https://luxia.melanoinc.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--gold)]"
          >
            Luxia
          </a>
          <a
            href="https://alenya.melanoinc.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--gold)]"
          >
            Alenya
          </a>
        </div>
      </div>
    </footer>
  );
}
