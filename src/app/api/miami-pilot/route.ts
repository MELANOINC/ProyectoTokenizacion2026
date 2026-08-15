import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAlenyaSupabase } from "@/lib/alenya/supabase";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional().default(""),
  asset_type: z.string().trim().min(2).max(120),
  asset_location: z.string().trim().max(180).optional().default(""),
  approx_asset_value: z.string().trim().max(40).optional().default(""),
  goal: z.string().trim().min(2).max(180),
  authorized_representative: z.enum(["yes", "no", "not_sure"]),
  description: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().default(""),
  utm_source: z.string().trim().max(120).optional().default(""),
  utm_medium: z.string().trim().max(120).optional().default(""),
  utm_campaign: z.string().trim().max(160).optional().default("NOTORIUS_MIAMI_PILOT"),
});

export async function GET() {
  try {
    const supabase = getAlenyaSupabase();
    const { data, error } = await supabase.rpc("notorius_miami_pilot_health");
    if (error) {
      return NextResponse.json({ ok: false, service: "notorius-miami-pilot", error: "CRM unavailable" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, service: "notorius-miami-pilot", crm: data }, { status: 200 });
  } catch (error) {
    console.error("NOTORIUS Miami health error", error);
    return NextResponse.json({ ok: false, service: "notorius-miami-pilot", error: "Health check failed" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please review the required fields.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const payload = {
      ...parsed.data,
      website: undefined,
      referrer: req.headers.get("referer") ?? "",
      user_agent: req.headers.get("user-agent") ?? "",
      utm_campaign: parsed.data.utm_campaign || "NOTORIUS_MIAMI_PILOT",
    };

    const supabase = getAlenyaSupabase();
    const { data, error } = await supabase.rpc("intake_notorius_miami_pilot", { payload });

    if (error) {
      console.error("NOTORIUS Miami intake error", error.message);
      return NextResponse.json(
        { ok: false, error: "We could not submit your application. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, application: data }, { status: 200 });
  } catch (error) {
    console.error("NOTORIUS Miami intake unexpected error", error);
    return NextResponse.json(
      { ok: false, error: "Unexpected error. Please try again." },
      { status: 500 },
    );
  }
}
