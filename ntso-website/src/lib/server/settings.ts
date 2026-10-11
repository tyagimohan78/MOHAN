import "server-only";
import { cache } from "react";
import { db } from "./db";

// Admin-editable website settings. Empty values mean "not published yet" and the UI hides them.
export const SETTING_KEYS = {
  businessHours: "Business hours",
  phone: "Public phone number",
  whatsapp: "WhatsApp number",
  address: "Registered / office address",
  mapEmbedUrl: "Google Maps embed URL (https://www.google.com/maps/embed?...)",
  linkedinUrl: "LinkedIn company page URL",
  facebookUrl: "Facebook page URL",
  xUrl: "X (Twitter) profile URL",
  instagramUrl: "Instagram profile URL",
  youtubeUrl: "YouTube channel URL",
  announcement: "Site-wide announcement bar text",
  supportNote: "Support Center notice (e.g. holiday schedule)",
  gstin: "GSTIN (publish only once verified)",
  cin: "CIN (publish only once verified)",
} as const;
export type SettingKey = keyof typeof SETTING_KEYS;
export type SiteSettings = Record<SettingKey, string>;

export const DEFAULT_SETTINGS: SiteSettings = {
  businessHours: "",
  phone: "",
  whatsapp: "",
  address: "",
  mapEmbedUrl: "",
  linkedinUrl: "",
  facebookUrl: "",
  xUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  announcement: "",
  supportNote: "",
  gstin: "",
  cin: "",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.setting.findMany();
    const out = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in out) out[r.key as SettingKey] = r.value;
    return out;
  } catch (err) {
    console.error("[settings] database unavailable, using defaults", err);
    return { ...DEFAULT_SETTINGS };
  }
});
