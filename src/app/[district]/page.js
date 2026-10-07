import HomeClient from "@/components/HomeClient";
import {
  fetchHomeData,
  fetchContactData,
  fetchServicesData,
  fetchFullCatalog,
  fetchDistrictData,
} from "@/lib/data-fetcher-server";

export const revalidate = 0;

export default async function DistrictPage({ params }) {
  const { district = "jaipur" } = await params;

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const [homeData, contactData, servicesData, products, districtData] = await Promise.all([
    fetchHomeData().catch(() => null),
    fetchContactData().catch(() => null),
    fetchServicesData().catch(() => null),
    fetchFullCatalog().catch(() => []),
    fetchDistrictData(district).catch(() => null),
  ]);

  return (
    <HomeClient
      city={city}
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