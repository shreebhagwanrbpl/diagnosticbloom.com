import ContactClient from "@/components/ContactClient";
import { fetchContactData } from "@/lib/data-fetcher-server";

export const revalidate = 0;

export default async function Page({ city = "" }) {
  const contactData = await fetchContactData().catch(() => null);

  return (
    <ContactClient
      initialContactInfo={contactData?.contactInfo || []}
      city={city}
    />
  );
}