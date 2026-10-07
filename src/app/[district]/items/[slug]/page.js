import ProductDetails from "../../../items/[slug]/ProductDetails";
import { fetchFullCatalog, fetchContactData } from "@/lib/data-fetcher-server";
import { makeSlug } from "@/data/productsData";

export const revalidate = 0;

export default async function Page({ params }) {
    const { slug, district } = await params;

    const [catalog, contactData] = await Promise.all([
        fetchFullCatalog().catch(() => []),
        fetchContactData().catch(() => null),
    ]);

    const initialProduct = Array.isArray(catalog)
        ? catalog.find((p) => p.slug === slug || makeSlug(p.title) === slug || p.id === slug) || null
        : null;

    return (
        <ProductDetails
            slug={slug}
            district={district}
            initialProduct={initialProduct}
            initialContactInfo={contactData?.contactInfo || []}
        />
    );
}