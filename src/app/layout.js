import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { fetchContactData, fetchFullCatalog } from "@/lib/data-fetcher-server";

export const metadata = {
  metadataBase: new URL(
    "https://diagnosticbloom.com"
  ),

  title:
    "Raj Biosis | Biomedical & Diagnostic Equipment",

  description:
    "Raj Biosis Private Limited supplies CBC Machines, Hematology Analyzers, Biochemistry Analyzers, ELISA Readers and laboratory equipment across India.",

  keywords: [
    "Biomedical Equipment Supplier",
    "Laboratory Equipment Supplier",
    "CBC Machine Supplier",
    "Hematology Analyzer Supplier",
    "Biochemistry Analyzer Supplier",
    "Diagnostic Equipment Supplier",
    "Medical Equipment Supplier India",
    "Raj Biosis",
    "Raj Biosis",
  ],

  openGraph: {
    title:
      "Raj Biosis | Biomedical & Diagnostic Equipment",

    description:
      "A structured enterprise look for procurement teams and diagnostic networks.",

    url: "https://diagnosticbloom.com",

    siteName: "Raj Biosis Private Limited",

    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Raj Biosis Private Limited",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Raj Biosis | Biomedical & Diagnostic Equipment",

    description:
      "A structured enterprise look for procurement teams and diagnostic networks.",

    images: ["/logo.png"],
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  alternates: {
    canonical: "https://diagnosticbloom.com",
  },
};

export default async function RootLayout({
  children,
}) {
  const [contactData, catalog] = await Promise.all([
    fetchContactData().catch(() => null),
    fetchFullCatalog().catch(() => []),
  ]);

  const initialContactInfo = contactData?.contactInfo || [];
  const catSet = new Set();
  if (Array.isArray(catalog)) {
    catalog.forEach((p) => {
      if (p.category && String(p.category).trim() && String(p.category).trim() !== "All Categories") {
        catSet.add(String(p.category).trim());
      }
    });
  }
  const initialCategories = Array.from(catSet);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#f8fafc] text-[#0f172a]" suppressHydrationWarning>
        <Navbar />

        <main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          {children}
        </main>

        <Footer
          initialContactInfo={initialContactInfo}
          initialCategories={initialCategories}
        />
        <ScrollToTop />
      </body>
    </html>
  );
}