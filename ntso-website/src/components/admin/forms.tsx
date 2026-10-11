"use client";

import { useActionState } from "react";
import type { AdminUser, Faq, ProductCategory, Service } from "@prisma/client";
import { saveCategory, saveFaq, saveService, saveSettings, saveUser, changeOwnPassword, type AdminFormState } from "@/app/admin/actions";
import { FormMessage } from "@/components/forms/fields";
import { ActionForm, Check, Field, SaveButton } from "./form-bits";

export function CategoryForm({ category, icons }: { category?: ProductCategory; icons: string[] }) {
  const [s, action] = useActionState<AdminFormState, FormData>(saveCategory, {});
  const e = s.errors || {};
  const c = category;
  return (
    <ActionForm action={action} className="space-y-4">
      <FormMessage message={s.message} />
      <input type="hidden" name="id" value={c?.id || ""} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Name *" name="name" error={e.name}><input id="name" name="name" defaultValue={c?.name} required className="input" /></Field>
        <Field label="Slug" name="slug" error={e.slug} hint="Blank = generated"><input id="slug" name="slug" defaultValue={c?.slug} className="input" /></Field>
        <Field label="Type *" name="kind" error={e.kind}>
          <select id="kind" name="kind" defaultValue={c?.kind || "HARDWARE"} className="input"><option value="HARDWARE">Hardware</option><option value="SOFTWARE">Software & licensing</option></select>
        </Field>
        <Field label="Group *" name="group" error={e.group} hint="e.g. Networking Products, Microsoft, Sophos"><input id="group" name="group" defaultValue={c?.group} required className="input" /></Field>
        <Field label="Icon *" name="icon" error={e.icon}>
          <select id="icon" name="icon" defaultValue={c?.icon || "package"} className="input">{icons.map((i) => <option key={i} value={i}>{i}</option>)}</select>
        </Field>
        <Field label="Sort order" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} className="input" /></Field>
      </div>
      <Field label="Description *" name="description" error={e.description}><textarea id="description" name="description" defaultValue={c?.description} required rows={2} maxLength={600} className="input" /></Field>
      <div className="flex gap-6"><Check name="published" label="Published" defaultChecked={c?.published ?? true} /><Check name="featured" label="Featured" defaultChecked={c?.featured} /></div>
      <SaveButton>{c ? "Save category" : "Create category"}</SaveButton>
    </ActionForm>
  );
}

export const SERVICE_PAGES: Record<string, string> = {
  network: "Networking & Infrastructure",
  cloud: "Cloud Solutions",
  cybersecurity: "Cybersecurity",
  cctv: "CCTV & Surveillance",
  support: "Support Center / AMC",
  procurement: "IT Procurement",
};

export function ServiceForm({ service, pageKey }: { service?: Service; pageKey: string }) {
  const [s, action] = useActionState<AdminFormState, FormData>(saveService, {});
  const e = s.errors || {};
  return (
    <ActionForm action={action} className="space-y-4">
      <FormMessage message={s.message} />
      <input type="hidden" name="id" value={service?.id || ""} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Page *" name="pageKey"><select id="pageKey" name="pageKey" defaultValue={service?.pageKey || pageKey} className="input">{Object.entries(SERVICE_PAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="Group heading *" name="group" error={e.group}><input id="group" name="group" defaultValue={service?.group} required className="input" /></Field>
        <Field label="Delivery *" name="delivery" error={e.delivery}>
          <select id="delivery" name="delivery" defaultValue={service?.delivery || "DIRECT"} className="input">
            <option value="DIRECT">Delivered by NTSO</option><option value="DIRECT_OR_PARTNER">NTSO and/or partner</option><option value="PARTNER">Delivered via partner</option>
          </select>
        </Field>
      </div>
      <Field label="Service name *" name="name" error={e.name}><input id="name" name="name" defaultValue={service?.name} required className="input" /></Field>
      <Field label="Description *" name="description" error={e.description}><textarea id="description" name="description" defaultValue={service?.description} required rows={2} className="input" /></Field>
      <div className="flex items-end gap-6">
        <Field label="Sort order" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} className="input w-28" /></Field>
        <Check name="published" label="Published" defaultChecked={service?.published ?? true} />
      </div>
      <SaveButton>{service ? "Save service" : "Add service"}</SaveButton>
    </ActionForm>
  );
}

export function FaqForm({ faq }: { faq?: Faq }) {
  const [s, action] = useActionState<AdminFormState, FormData>(saveFaq, {});
  const e = s.errors || {};
  return (
    <ActionForm action={action} className="space-y-4">
      <FormMessage message={s.message} />
      <input type="hidden" name="id" value={faq?.id || ""} />
      <Field label="Question *" name="question" error={e.question}><input id="question" name="question" defaultValue={faq?.question} required className="input" /></Field>
      <Field label="Answer *" name="answer" error={e.answer}><textarea id="answer" name="answer" defaultValue={faq?.answer} required rows={4} className="input" /></Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Category *" name="category" error={e.category}><input id="category" name="category" defaultValue={faq?.category || "General"} required className="input" /></Field>
        <Field label="Sort order" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={faq?.sortOrder ?? 0} className="input" /></Field>
        <div className="flex items-end gap-6 pb-2"><Check name="published" label="Published" defaultChecked={faq?.published ?? true} /><Check name="showOnHome" label="Show on homepage" defaultChecked={faq?.showOnHome} /></div>
      </div>
      <SaveButton>{faq ? "Save FAQ" : "Add FAQ"}</SaveButton>
    </ActionForm>
  );
}

export function SettingsForm({ values, labels }: { values: Record<string, string>; labels: Record<string, string> }) {
  const [s, action] = useActionState<AdminFormState, FormData>(saveSettings, {});
  const e = s.errors || {};
  const multiline = new Set(["address", "supportNote"]);
  return (
    <ActionForm action={action} className="space-y-5">
      <FormMessage message={s.message} ok={s.ok} />
      <div className="grid gap-5 md:grid-cols-2">
        {Object.entries(labels).map(([k, label]) => (
          <Field key={k} label={label} name={k} error={e[k]}>
            {multiline.has(k) ? <textarea id={k} name={k} defaultValue={values[k]} rows={3} className="input" /> : <input id={k} name={k} defaultValue={values[k]} className="input" />}
          </Field>
        ))}
      </div>
      <p className="text-xs text-slate-500">Leave a field empty to hide it on the website. Publish address, phone, GSTIN, CIN and social links only once verified.</p>
      <SaveButton>Save settings</SaveButton>
    </ActionForm>
  );
}

export function UserForm({ user }: { user?: Pick<AdminUser, "id" | "name" | "email" | "role" | "active"> }) {
  const [s, action] = useActionState<AdminFormState, FormData>(saveUser, {});
  const e = s.errors || {};
  return (
    <ActionForm action={action} className="space-y-4">
      <FormMessage message={s.message} />
      <input type="hidden" name="id" value={user?.id || ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name *" name="name" error={e.name}><input id="name" name="name" defaultValue={user?.name} required className="input" /></Field>
        <Field label="Email *" name="email" error={e.email}><input id="email" name="email" type="email" defaultValue={user?.email} required className="input" autoComplete="off" /></Field>
        <Field label="Role *" name="role" error={e.role} hint="ADMIN: everything · SALES: enquiries & customers · SUPPORT: tickets & customers · CONTENT: catalogue, services, FAQs">
          <select id="role" name="role" defaultValue={user?.role || "SALES"} className="input">{["ADMIN", "SALES", "SUPPORT", "CONTENT"].map((r) => <option key={r} value={r}>{r}</option>)}</select>
        </Field>
        <Field label={user ? "New password (leave blank to keep)" : "Initial password *"} name="password" error={e.password} hint="Min. 12 characters with upper/lower-case letters and a number.">
          <input id="password" name="password" type="password" autoComplete="new-password" className="input" />
        </Field>
      </div>
      <Check name="active" label="Active (can sign in)" defaultChecked={user?.active ?? true} />
      <div><SaveButton>{user ? "Save user" : "Create user"}</SaveButton></div>
    </ActionForm>
  );
}

export function PasswordForm() {
  const [s, action] = useActionState<AdminFormState, FormData>(changeOwnPassword, {});
  const e = s.errors || {};
  return (
    <ActionForm action={action} className="max-w-md space-y-4">
      <FormMessage message={s.message} ok={s.ok} />
      <Field label="Current password" name="current" error={e.current}><input id="current" name="current" type="password" autoComplete="current-password" required className="input" /></Field>
      <Field label="New password" name="password" error={e.password} hint="Min. 12 characters with upper/lower-case letters and a number."><input id="password" name="password" type="password" autoComplete="new-password" required className="input" /></Field>
      <Field label="Confirm new password" name="confirm" error={e.confirm}><input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" /></Field>
      <SaveButton>Change password</SaveButton>
    </ActionForm>
  );
}
