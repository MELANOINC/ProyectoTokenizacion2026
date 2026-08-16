import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/melano-mark.svg"
            alt="Melano Inc"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <span className="leading-tight">
            <strong className="block font-[family-name:var(--font-display)] text-sm tracking-[0.18em] text-[var(--w)]">
              NOTORIUS
            </strong>
            <small className="block text-[11px] text-[var(--g1)]">
              Melano Inc · Tokenización
            </small>
          </span>
        </Link>

      </div>
    </header>
  );
}
