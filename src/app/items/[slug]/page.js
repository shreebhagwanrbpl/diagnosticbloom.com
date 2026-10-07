import ProductDetails from "./ProductDetails";
import { fetchFullCatalog, fetchContactData } from "@/lib/data-fetcher-server";
import { makeSlug } from "@/data/productsData";

export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const productName = slug
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (c) => c.toUpperCase());

    const title = `${productName} Supplier in India | Price, Dealer & Distributor | Raj Biosis Private Limited`;
    const description = `Buy ${productName} at best price in India. Trusted supplier, dealer and distributor of ${productName} for hospitals, laboratories, diagnostic centers, research institutes and healthcare facilities. Contact Raj Biosis Private Limited for latest quotation and product details.`;
    const url = `https://diagnosticbloom.com/items/${slug}`;

    return {
        title,
        description,
        keywords: [
            productName,
            `${productName} Supplier`,
            `${productName} Dealer`,
            `${productName} Distributor`,
            `${productName} Manufacturer`,
            `${productName} Exporter`,
            `${productName} Price`,
            `${productName} Price in India`,
            `${productName} Supplier in India`,
            `${productName} Dealer in India`,
            `${productName} Distributor in India`,
            `Buy ${productName}`,
            `${productName} for Laboratory`,
            `${productName} for Hospital`,
            `${productName} for Diagnostic Center`,
            "Biomedical Equipment",
            "Medical Equipment",
            "Laboratory Equipment",
            "Diagnostic Equipment",
            "Hospital Equipment",
            "Healthcare Equipment",
            "Raj Biosis Private Limited",
            "Raj Biosis",
        ],
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: "Raj Biosis Private Limited",
            type: "website",
            locale: "en_IN",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        metadataBase: new URL("https://diagnosticbloom.com"),
    };
}

export default async function Page({ params }) {
    const { slug } = await params;

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
            initialProduct={initialProduct}
            initialContactInfo={contactData?.contactInfo || []}
        />
    );
}