"use client";

import { useActionState } from "react";
import type { Product, ProductCategory } from "@prisma/client";
import { saveProduct, type AdminFormState } from "@/app/admin/actions";
import { FormMessage } from "@/components/forms/fields";
import { ActionForm, Check, Field, SaveButton } from "./form-bits";

export function ProductForm({ product, categories }: { product?: Product; categories: Pick<ProductCategory, "id" | "name" | "kind" | "group">[] }) {
  const [state, action] = useActionState<AdminFormState, FormData>(saveProduct, {});
  const e = state.errors || {};
  const p = product;
  return (
    <ActionForm action={action} className="space-y-6" encType="multipart/form-data">
      <FormMessage message={state.message} ok={state.ok} />
      <input type="hidden" name="id" value={p?.id || ""} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name *" name="name" error={e.name}><input id="name" name="name" defaultValue={p?.name} required maxLength={200} className="input" /></Field>
        <Field label="URL slug" name="slug" error={e.slug} hint="Leave blank to generate from the name."><input id="slug" name="slug" defaultValue={p?.slug} maxLength={120} className="input" /></Field>
        <Field label="Category *" name="categoryId" error={e.categoryId}>
          <select id="categoryId" name="categoryId" defaultValue={p?.categoryId || ""} required className="input">
            <option value="" disabled>Select…</option>
            {["HARDWARE", "SOFTWARE"].map((k) => (
              <optgroup key={k} label={k === "HARDWARE" ? "Hardware" : "Software & licensing"}>
                {categories.filter((c) => c.kind === k).map((c) => <option key={c.id} value={c.id}>{c.group} — {c.name}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Vendor / brands" name="vendor" error={e.vendor}><input id="vendor" name="vendor" defaultValue={p?.vendor || ""} maxLength={200} className="input" /></Field>
      </div>
      <Field label="Short description *" name="shortDescription" error={e.shortDescription}><input id="shortDescription" name="shortDescription" defaultValue={p?.shortDescription} required maxLength={300} className="input" /></Field>
      <Field label="Full description *" name="description" error={e.description}><textarea id="description" name="description" defaultValue={p?.description} required rows={5} maxLength={6000} className="input" /></Field>
      <Field label="Highlights (one per line)" name="highlights" error={e.highlights}><textarea id="highlights" name="highlights" defaultValue={p?.highlights.join("\n")} rows={4} className="input" /></Field>
      <Field label="Typical use case" name="useCase" error={e.useCase}><input id="useCase" name="useCase" defaultValue={p?.useCase || ""} maxLength={300} className="input" /></Field>
      <fieldset className="rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-navy-900">Licensing attributes (software only)</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="License type" name="licenseType" error={e.licenseType}><input id="licenseType" name="licenseType" defaultValue={p?.licenseType || ""} className="input" placeholder="e.g. Cloud subscription" /></Field>
          <Field label="Subscription term" name="subscriptionTerm" error={e.subscriptionTerm}><input id="subscriptionTerm" name="subscriptionTerm" defaultValue={p?.subscriptionTerm || ""} className="input" placeholder="e.g. 1 year" /></Field>
          <Field label="Licensed per (users/devices)" name="licensedPer" error={e.licensedPer}><input id="licensedPer" name="licensedPer" defaultValue={p?.licensedPer || ""} className="input" placeholder="e.g. Per user" /></Field>
        </div>
      </fieldset>
      <fieldset className="rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-navy-900">Image</legend>
        {p?.imageUrl && (
          <div className="mb-3 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imageUrl} alt="" className="h-20 w-28 rounded-lg border object-contain" />
            <Check name="removeImage" label="Remove current image" />
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Upload image (PNG, JPG or WebP, max 5 MB)" name="image" error={e.image}><input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm" /></Field>
          <Field label="Image alt text" name="imageAlt" error={e.imageAlt}><input id="imageAlt" name="imageAlt" defaultValue={p?.imageAlt || ""} className="input" /></Field>
        </div>
        <p className="mt-2 text-xs text-slate-500">Use only images you have rights to publish. Do not use manufacturer logos in a way that implies partnership.</p>
      </fieldset>
      <div className="flex flex-wrap items-center gap-6">
        <Field label="Sort order" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className="input w-28" /></Field>
        <Check name="published" label="Published" defaultChecked={p?.published ?? true} />
        <Check name="featured" label="Featured" defaultChecked={p?.featured ?? false} />
        <Check name="isSample" label="Sample listing (not yet verified)" defaultChecked={p?.isSample ?? false} />
      </div>
      <SaveButton>{p ? "Save product" : "Create product"}</SaveButton>
    </ActionForm>
  );
}
