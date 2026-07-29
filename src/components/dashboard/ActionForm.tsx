"use client";

import { FormEvent, useState } from "react";

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "number";
  required?: boolean;
};

export function ActionForm({
  actionLabel,
  endpoint,
  fields,
  transform,
  onSuccess,
}: {
  actionLabel: string;
  endpoint: string;
  fields: Field[];
  transform?: (values: Record<string, string>) => Record<string, unknown>;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const raw: Record<string, string> = {};
    for (const field of fields) {
      raw[field.name] = String(form.get(field.name) ?? "");
    }

    const payload = transform ? transform(raw) : raw;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? "Request failed");
      }
      setStatus("OK");
      formElement.reset();
      onSuccess?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-4 p-5">
      {fields.map((field) => (
        <label key={field.name} className="block">
          <span className="text-sm font-medium text-[var(--ink-soft)]">
            {field.label}
          </span>
          <input
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            required={field.required !== false}
            className="field mt-1"
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary disabled:opacity-60"
      >
        {pending ? "Procesando…" : actionLabel}
      </button>
      {status ? (
        <p
          className={`text-sm ${status === "OK" ? "text-[var(--mint)]" : "text-[#f97066]"}`}
        >
          {status === "OK" ? "Operación registrada." : status}
        </p>
      ) : null}
    </form>
  );
}
