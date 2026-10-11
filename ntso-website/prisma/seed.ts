/* Idempotent seed: catalog categories, SAMPLE products/licenses, services and FAQs.
   Existing records (matched by slug / name) are left untouched so admin edits are preserved. */
import { PrismaClient } from "@prisma/client";
import { faqs, hardwareCategories, hardwareProducts, licenseProducts, services, softwareCategories } from "./seed-data";

const db = new PrismaClient();

async function main() {
  let order = 0;
  for (const c of hardwareCategories) {
    await db.productCategory.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, kind: "HARDWARE", sortOrder: order++, featured: !!c.featured } });
  }
  order = 0;
  for (const c of softwareCategories) {
    await db.productCategory.upsert({ where: { slug: c.slug }, update: {}, create: { ...c, kind: "SOFTWARE", sortOrder: order++, featured: !!c.featured } });
  }
  const cats = new Map((await db.productCategory.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
  order = 0;
  for (const p of [...hardwareProducts, ...licenseProducts]) {
    const { category, ...rest } = p;
    const categoryId = cats.get(category);
    if (!categoryId) throw new Error(`Unknown category ${category} for ${p.slug}`);
    await db.product.upsert({ where: { slug: p.slug }, update: {}, create: { ...rest, categoryId, featured: !!p.featured, isSample: true, sortOrder: order++ } });
  }
  if ((await db.service.count()) === 0) {
    for (const [pageKey, list] of Object.entries(services)) {
      await db.service.createMany({ data: list.map((s, i) => ({ ...s, pageKey, sortOrder: i, delivery: s.delivery ?? "DIRECT" })) });
    }
  }
  if ((await db.faq.count()) === 0) {
    await db.faq.createMany({ data: faqs.map((f, i) => ({ ...f, showOnHome: !!f.showOnHome, sortOrder: i })) });
  }
  console.log(`Seeded: ${await db.productCategory.count()} categories, ${await db.product.count()} products, ${await db.service.count()} services, ${await db.faq.count()} FAQs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
