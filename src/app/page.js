import HomeClient from "@/components/HomeClient";
import {
  fetchHomeData,
  fetchContactData,
  fetchServicesData,
  fetchFullCatalog,
} from "@/lib/data-fetcher-server";

export const revalidate = 0;

export default async function Page() {
  const [homeData, contactData, servicesData, products] = await Promise.all([
    fetchHomeData().catch(() => null),
    fetchContactData().catch(() => null),
    fetchServicesData().catch(() => null),
    fetchFullCatalog().catch(() => []),
  ]);

  return (
    <HomeClient
      initialHomeData={homeData}
      initialContactInfo={contactData?.contactInfo || []}
      initialServices={
        Array.isArray(servicesData?.services)
          ? servicesData.services.filter((s) => s && (s.title || s.desc || s.description))
          : []
      }
      initialProducts={Array.isArray(products) ? products : []}
    />
  );
}