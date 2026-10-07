import ItemsClient from "@/components/ItemsClient";
import { fetchFullCatalog } from "@/lib/data-fetcher-server";

export const revalidate = 0;

export default async function Page({ city = "" }) {
  const products = await fetchFullCatalog().catch(() => []);

  return <ItemsClient initialProducts={Array.isArray(products) ? products : []} city={city} />;
}