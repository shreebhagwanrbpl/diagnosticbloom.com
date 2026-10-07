import ServicesClient from "@/components/ServicesClient";
import { fetchServicesData, fetchContactData } from "@/lib/data-fetcher-server";

export const revalidate = 0;

export default async function Page({ city = "" }) {
  const [servicesData, contactData] = await Promise.all([
    fetchServicesData().catch(() => null),
    fetchContactData().catch(() => null),
  ]);

  const initialServices = Array.isArray(servicesData?.services)
    ? servicesData.services.filter((s) => s && (s.title || s.desc || s.description))
    : [];

  return (
    <ServicesClient
      initialServices={initialServices}
      initialContactInfo={contactData?.contactInfo || []}
      city={city}
    />
  );
}