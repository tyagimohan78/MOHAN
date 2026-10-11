import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminHeader, Card, Flash } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmButton } from "@/components/admin/form-bits";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteProduct } from "@/app/admin/actions";

export const metadata = { title: "Edit product" };

export default async function ProductEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  await requirePage("catalog");
  const { id } = await params;
  const sp = await searchParams;
  const categories = await db.productCategory.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, kind: true, group: true } });
  if (id === "new") {
    return (
      <>
        <AdminHeader back={{ href: "/admin/products", label: "Products" }} title="New product or license" />
        <Card><ProductForm categories={categories} /></Card>
      </>
    );
  }
  const product = await db.product.findUnique({ where: { id }, include: { category: { select: { slug: true, kind: true } } } });
  if (!product) notFound();
  const publicUrl = product.category.kind === "SOFTWARE" ? `/software-licensing/${product.slug}` : `/products/${product.category.slug}/${product.slug}`;
  return (
    <>
      <AdminHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={product.name}
        actions={
          <>
            {product.published && <Link href={publicUrl} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">View on site <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmButton message={`Delete “${product.name}”? This cannot be undone.`}>Delete</ConfirmButton>
            </form>
          </>
        }
      />
      <Flash sp={sp} />
      <Card><ProductForm product={product} categories={categories} /></Card>
    </>
  );
}
