"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "@/lib/client-api";
import { db } from "@/lib/client-api";
import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  PhoneCall,
  Mail,
  Wrench,
  Award,
  Clock,
  Zap,
  SearchX,
} from "lucide-react";

import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import HeroCarousel from "@/components/HeroCarousel";
import { fetchAllDynamicProducts } from "@/lib/fetchProducts";

const stats = [
  {
    number: "5,000+",
    title: "Healthcare Partners",
    desc: "Hospitals & labs served nationwide",
    icon: Building2,
  },
  {
    number: "3,500+",
    title: "Products & Kits",
    desc: "Precision diagnostic instruments",
    icon: Microscope,
  },
  {
    number: "10+ Yrs",
    title: "Engineering Excellence",
    desc: "Proven biomedical leadership",
    icon: ShieldCheck,
  },
  {
    number: "99.9%",
    title: "Accuracy SLA",
    desc: "NABL & ISO certified standards",
    icon: Award,
  },
];

const pillars = [
  {
    title: "Certified Calibration Standards",
    desc: "Every diagnostic analyzer undergoes NABL-traceable calibration to ensure precise patient diagnostics and regulatory safety.",
    icon: Award,
    badge: "ISO 13485 Certified",
  },
  {
    title: "24/7 Emergency AMC Response",
    desc: "Our nationwide team of biomedical engineers delivers rapid on-site maintenance to keep critical ICU and OT gear active.",
    icon: Zap,
    badge: "2-Hour SLA",
  },
  {
    title: "Turnkey Lab Setup & Engineering",
    desc: "From architectural workflow layout to instrument installation and staff certification, we engineer complete pathology labs.",
    icon: Building2,
    badge: "Turnkey Engineering",
  },
  {
    title: "Cold-Chain Reagent Supply",
    desc: "Strictly temperature-monitored distribution of biochemistry reagents, controls, and rapid assay kits with extended shelf life.",
    icon: FlaskConical,
    badge: "Monitored Cold Chain",
  },
];

const testimonials = [
  {
    quote: "Raj Biosis transformed our central laboratory setup. Their automated analyzers increased our daily sample throughput by 40% with zero downtime.",
    author: "Dr. Arvind Sharma",
    role: "Chief Pathologist",
    institution: "Apollo Diagnostics Center",
    rating: 5,
  },
  {
    quote: "The 24/7 AMC response team is outstanding. When our ICU patient monitor system faced a sensor issue, their engineer arrived within 90 minutes.",
    author: "Dr. Meenakshi Sundaram",
    role: "Medical Director",
    institution: "Metro Multispecialty Hospital",
    rating: 5,
  },
  {
    quote: "Their cold-chain reagent delivery has never failed us. Quality control results are consistently accurate, month after month.",
    author: "Rajesh Varma",
    role: "Laboratory Operations Manager",
    institution: "LifeCare PathLabs",
    rating: 5,
  },
];

export default function HomeClient({
  initialHomeData = null,
  initialContactInfo = [],
  initialServices = [],
  initialProducts = [],
  city = "",
}) {
  const [services, setServices] = useState(initialServices);
  const [products, setProducts] = useState(initialProducts);
  const [homeData, setHomeData] = useState(initialHomeData);
  const [contactInfo, setContactInfo] = useState(initialContactInfo);
  const [loading, setLoading] = useState(!initialHomeData && !initialProducts.length);

  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);

  const staticRoutes = ["about", "services", "items", "contact"];
  const district =
    pathParts.length > 0 && !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const locationTitle = city || (district ? district.replace(/-/g, " ") : "");

  const makeLink = (path) => {
    if (!district) return path;
    if (path === "/") return `/${district}`;
    return `/${district}${path}`;
  };

  useEffect(() => {
    // If initial server data is already present, we are instantly ready!
    if (initialHomeData || initialProducts.length > 0) {
      setLoading(false);
    }

    let isMounted = true;

    // Background sync to ensure fresh data without blocking initial render
    const syncData = async () => {
      try {
        const [homeSnap, contactSnap, serviceSnap, fetchedProducts] = await Promise.all([
          getDoc(doc(db, "websites", "diagnosticbloomcom", "pages", "home")).catch(() => null),
          getDoc(doc(db, "websites", "diagnosticbloomcom", "pages", "contact")).catch(() => null),
          getDoc(doc(db, "websites", "diagnosticbloomcom", "pages", "services")).catch(() => null),
          fetchAllDynamicProducts().catch(() => []),
        ]);

        if (!isMounted) return;

        if (homeSnap && homeSnap.exists()) {
          setHomeData(homeSnap.data());
        }

        if (contactSnap && contactSnap.exists()) {
          setContactInfo(contactSnap.data().contactInfo || []);
        }

        if (serviceSnap && serviceSnap.exists() && Array.isArray(serviceSnap.data().services)) {
          setServices(
            serviceSnap.data().services
              .filter((s) => s && (s.title || s.desc || s.description))
              .map((s) => ({ ...s, title: s.title || "", desc: s.desc || s.description || "" }))
          );
        }

        if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
      } catch (err) {
        console.error("Background sync error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // If we didn't have server data, fetch immediately
    if (!initialHomeData && !initialProducts.length) {
      syncData();
    } else {
      // Revalidate in background after a slight delay
      const timer = setTimeout(syncData, 500);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [initialHomeData, initialProducts.length]);

  const showcaseProducts = products.slice(0, 3);
  const showcaseServices = services.slice(0, 3);

  const serviceIcons = [
    <Microscope size={28} key={1} />,
    <Building2 size={28} key={2} />,
    <Wrench size={28} key={3} />,
    <FlaskConical size={28} key={4} />,
    <Stethoscope size={28} key={5} />,
    <Award size={28} key={6} />,
  ];

  // Helper to extract dynamic phone from contact info
  const helplinePhone = (() => {
    const item = contactInfo.find(
      (c) =>
        c?.label?.toLowerCase().includes("phone") ||
        c?.label?.toLowerCase().includes("mobile") ||
        c?.label?.toLowerCase().includes("helpline") ||
        c?.label?.toLowerCase().includes("contact")
    );
    if (!item) return "";
    if (Array.isArray(item.value)) return item.value[0] || "";
    return typeof item.value === "string" ? item.value.trim() : "";
  })();

  // Helper to extract dynamic email from contact info
  const supportEmail = (() => {
    const item = contactInfo.find(
      (c) =>
        c?.label?.toLowerCase().includes("email") ||
        c?.label?.toLowerCase().includes("mail")
    );
    if (!item) return "";
    if (Array.isArray(item.value)) return item.value[0] || "";
    return typeof item.value === "string" ? item.value.trim() : "";
  })();

  return (
    <div className="bg-[#f8fafc] text-[#0f172a]">
      {/* ================= DYNAMIC HERO BANNER & CAROUSEL ================= */}
      <HeroCarousel
        homeData={homeData}
        locationTitle={locationTitle}
        loading={loading}
        makeLink={makeLink}
      />

      {/* ================= STATS TICKER ================= */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-10 text-white shadow-inner">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3652BA]/25 text-indigo-300 border border-[#3652BA]/40">
                    <Icon size={26} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {item.number}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-indigo-200">{item.title}</p>
                    <p className="text-[11px] text-slate-300 hidden sm:block">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= PILLARS / WHY CHOOSE US ================= */}
      <section className="section-padding bg-gradient-to-b from-white via-[#f8fafc] to-[#eef2ff]/70">
        <div className="container-custom">
          <SectionTitle
            badge="Why Modern Labs Choose Us"
            title="One Platform. Many Possibilities."
            description="A structured enterprise look for procurement teams and diagnostic networks."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#3652BA]/50 hover:shadow-2xl hover:shadow-[#3652BA]/12"
                >
                  <div>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#3652BA] border border-indigo-100 transition-all duration-300 group-hover:bg-[#3652BA] group-hover:text-white group-hover:scale-110 shadow-xs">
                      <Icon size={28} />
                    </div>

                    <span className="mb-3 inline-block rounded-full bg-[#eef2ff] border border-indigo-200 px-3 py-1 text-xs font-bold text-[#3652BA]">
                      {pillar.badge}
                    </span>

                    <h3 className="mb-3 text-xl font-bold text-[#0f172a] group-hover:text-[#3652BA] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-[#64748b]">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#3652BA]">
                    <span>Learn standard</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS SHOWCASE ================= */}
      <section className="section-padding bg-white border-y border-slate-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionTitle
              badge="Diagnostic Inventory"
              title="Machine Showcase"
              description="Explore featured machines from our live diagnostic equipment catalog."
            />

            <Link
              href={makeLink("/items")}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#eef2ff] border border-indigo-200 px-6 py-3.5 text-sm font-bold text-[#3652BA] shadow-xs transition-all hover:bg-[#3652BA] hover:text-white hover:border-[#3652BA] shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Machine Showcase Carousel */}
          <div className="mt-10">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProductCard key={`prod-skeleton-${i}`} loading />
                ))}
              </div>
            ) : showcaseProducts.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible">
                {showcaseProducts.map((prod) => (
                  <div
                    key={prod.id || prod.slug}
                    className="min-w-[88%] snap-center sm:min-w-[55%] lg:min-w-0 relative z-0 hover:z-20"
                  >
                    <ProductCard product={prod} makeLink={makeLink} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ================= SERVICES MATRIX ================= */}
      <section className="section-padding bg-gradient-to-b from-[#eef2ff]/50 via-white to-[#f8fafc]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionTitle
              badge="Healthcare Solutions"
              title="Support Built Around Your Workflow"
              description="From NABL-certified calibration to 2-hour emergency repair response, our certified engineers support your clinical operations round the clock."
            />

            <Link
              href={makeLink("/services")}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#eef2ff] border border-indigo-200 px-6 py-3.5 text-sm font-bold text-[#3652BA] shadow-xs transition-all hover:bg-[#3652BA] hover:text-white hover:border-[#3652BA] shrink-0 self-start md:self-end"
            >
              <span>View All Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ServiceCard
                  key={`home-service-loading-${index}`}
                  loading
                />
              ))}
            </div>
          )}

          {/* Dynamic Service Cards (Exactly 3 cards) */}
          {!loading && showcaseServices.length > 0 && (
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {showcaseServices.map((srv, idx) => (
                <ServiceCard
                  key={srv.id || idx}
                  icon={serviceIcons[idx % serviceIcons.length]}
                  title={srv.title}
                  description={srv.desc}
                  badge={srv.badge}
                  turnaround={srv.turnaround}
                  highlights={srv.highlights}
                  makeLink={makeLink}
                />
              ))}
            </div>
          )}

          {/* Empty State: Services Not Found */}
          {!loading && services.length === 0 && (
            <div className="mt-16 mx-auto max-w-xl text-center py-14 px-8 rounded-3xl border border-slate-200 bg-white shadow-lg shadow-indigo-500/5">
              <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-3xl bg-[#EEF2FF] border border-indigo-100 text-[#3652BA] shadow-inner">
                <SearchX size={34} />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A]">
                Services Not Found
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#64748b] leading-relaxed">
                No technical services are currently listed in our catalog. Contact our certified biomedical engineers directly for turnkey lab setup, calibration, and emergency repair support.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={makeLink("/contact")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#3652BA] px-7 py-3.5 text-sm font-bold !text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-[#283d99] hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Contact Support Team</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href={makeLink("/items")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-7 py-3.5 text-sm font-bold text-[#0F172A] transition-all hover:bg-white hover:border-[#3652BA]"
                >
                  <span>View Equipment Catalog</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= ISO & QUALITY CERTIFICATION BANNER ================= */}
      <section className="section-padding bg-slate-900 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-[#3652BA]/25 blur-3xl" />
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#3652BA]/30 border border-[#3652BA]/50 px-4 py-1.5 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                <Award size={16} /> Quality Assurance & Compliance
              </span>

              <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Uncompromised Clinical Accuracy & Regulatory Standards
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                Raj Biosis strictly adheres to international quality protocols. Every equipment installation comes with complete IQ/OQ/PQ validation documentation and certified calibration reports.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-700 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#3652BA]" />
                    ISO 13485 & CE Compliance
                  </h4>
                  <p className="mt-2 text-xs text-slate-300">
                    Certified medical device quality management system for diagnostic analyzers.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock size={20} className="text-[#3652BA]" />
                    2-Hour SLA Maintenance
                  </h4>
                  <p className="mt-2 text-xs text-slate-300">
                    Dedicated engineer dispatch team ready for emergency hospital repairs.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-md text-center">
                <div className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] via-[#3652BA] to-[#283d99] text-white shadow-2xl shadow-indigo-500/50 border-2 border-indigo-300/40 p-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                    100%
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-100 mt-1">
                    Certified
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-bold text-white">
                  Compliance Guarantee
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  All instruments tested with traceable reference standards before dispatch to your medical facility.
                </p>
                <Link
                  href={makeLink("/contact")}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3652BA] !text-white px-8 py-3.5 text-sm font-bold shadow-xl shadow-indigo-600/40 transition-all hover:bg-[#283d99] hover:shadow-2xl hover:-translate-y-0.5 border border-indigo-400/30"
                >
                  <span className="!text-white font-bold">Request Inspection Certificate</span>
                  <ArrowRight size={16} className="!text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="section-padding bg-gradient-to-b from-white via-[#f8fafc] to-[#eef2ff]">
        <div className="container-custom">
          <SectionTitle
            badge="What Our Partners Say"
            title="Chosen by Diagnostic Teams"
            description="Read how healthcare professionals rely on Raj Biosis for accurate diagnostics and uninterrupted equipment uptime."
            center
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200"
              >
                <div>
                  <div className="flex gap-1 text-[#3652BA] mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-[#64748b] italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff] text-[#3652BA] font-bold text-lg">
                    {t.author.charAt(4) || "D"}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0f172a]">{t.author}</h4>
                    <p className="text-xs text-[#64748b]">{t.role} — <span className="text-[#3652BA] font-semibold">{t.institution}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= QUICK INQUIRY FORM SECTION ================= */}
      <section className="section-padding bg-gradient-to-br from-[#eef2ff]/60 via-white to-[#f8fafc] border-t border-slate-200">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <SectionTitle
                badge="Direct Consultation"
                title="Planning a Purchase or Need Technical Guidance?"
                description="Our biomedical engineering consultants will analyze your laboratory requirements, recommend optimal instruments, and provide a customized quote."
              />

              <div className="mt-8 space-y-4">
                {helplinePhone && (
                  <a
                    href={`tel:${String(helplinePhone).replace(/\s+/g, "")}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#3652BA]/40 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3652BA] shrink-0">
                      <PhoneCall size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b]">Direct Helpline</p>
                      <p className="text-base font-bold text-[#0f172a]">{helplinePhone}</p>
                    </div>
                  </a>
                )}

                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#3652BA]/40 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3652BA] shrink-0">
                      <Mail size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748b]">Official Email</p>
                      <p className="text-base font-bold text-[#0f172a] break-all">{supportEmail}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm
                title="Request a Tailored Equipment Plan"
                subtitle="Fill out the form below and our equipment specialist will reach out within 2 hours."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
