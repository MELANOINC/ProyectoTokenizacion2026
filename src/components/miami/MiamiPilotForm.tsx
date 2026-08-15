"use client";

import { FormEvent, useMemo, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function MiamiPilotForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const utm = useMemo(() => {
    if (typeof window === "undefined") return { utm_source: "", utm_medium: "", utm_campaign: "NOTORIUS_MIAMI_PILOT" };
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "NOTORIUS_MIAMI_PILOT",
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/miami-pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...utm }),
      });
      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Application failed");
      }

      form.reset();
      setStatus("success");
      setMessage("Application received. MELANO INC will review the asset and contact you for a technical fit call.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Application failed. Please try again.");
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#c9a96e]";

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm text-white/75">Name *<input className={inputClass} name="name" required minLength={2} /></label>
        <label className="text-sm text-white/75">Company / LLC<input className={inputClass} name="company" /></label>
        <label className="text-sm text-white/75">Email *<input className={inputClass} name="email" type="email" required /></label>
        <label className="text-sm text-white/75">Phone<input className={inputClass} name="phone" /></label>
        <label className="text-sm text-white/75">Asset type *
          <select className={inputClass} name="asset_type" required defaultValue="">
            <option value="" disabled>Select one</option>
            <option>Real Estate</option><option>Development Project</option><option>Company / LLC Interest</option><option>Commercial Asset</option><option>Collectible / Unique Asset</option><option>Contract / Digital Right</option><option>Other</option>
          </select>
        </label>
        <label className="text-sm text-white/75">Asset location<input className={inputClass} name="asset_location" placeholder="Miami, FL" /></label>
        <label className="text-sm text-white/75">Approx. asset value<input className={inputClass} name="approx_asset_value" placeholder="e.g. USD 2,500,000" /></label>
        <label className="text-sm text-white/75">What do you want to test? *
          <select className={inputClass} name="goal" required defaultValue="">
            <option value="" disabled>Select one</option>
            <option>Asset tokenization</option><option>Smart contract</option><option>Ownership registry</option><option>Digital asset structure</option><option>Not sure — assess my case</option>
          </select>
        </label>
        <label className="text-sm text-white/75 md:col-span-2">Are you the owner or authorized representative? *
          <select className={inputClass} name="authorized_representative" required defaultValue="">
            <option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option><option value="not_sure">Not sure</option>
          </select>
        </label>
        <label className="text-sm text-white/75 md:col-span-2">Brief description *
          <textarea className={inputClass} name="description" required minLength={10} rows={5} placeholder="Tell us what the asset is and what you would like to validate." />
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      </div>
      <p className="mt-5 text-xs leading-relaxed text-white/50">Private technical pilot only. This application is not an offer to buy or sell securities, an investment solicitation, or legal, tax, custody, or investment advice. Production issuance may require legal/compliance review and smart-contract security audit.</p>
      <button disabled={status === "sending"} className="mt-6 w-full rounded-xl bg-[#c9a96e] px-5 py-3.5 font-semibold text-black transition hover:brightness-110 disabled:opacity-60">
        {status === "sending" ? "Submitting…" : "Apply for one of 5 pilot spots"}
      </button>
      {message ? <p className={`mt-4 text-sm ${status === "success" ? "text-emerald-300" : "text-red-300"}`}>{message}</p> : null}
    </form>
  );
}
