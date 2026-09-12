"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  ShieldCheck,
  Award,
  Zap,
} from "lucide-react";

// Default high-quality fallback slides if database has no media configured yet
const FALLBACK_SLIDES = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1900&q=80",
    caption: "Automated Clinical Chemistry Analyzers",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1900&q=80",
    caption: "NABL-Traceable Calibration Laboratory",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1900&q=80",
    caption: "High-Throughput Hematology Systems",
  },
];

export default function HeroCarousel({
  homeData = null,
  locationTitle = "",
  makeLink = (path) => path,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const videoRefs = useRef({});

  // Parse media items from Firestore home data
  const parseMediaList = (data) => {
    if (!data) return [];
    const list = [];

    // 1. Check media array (preferred)
    if (Array.isArray(data.media) && data.media.length > 0) {
      data.media.forEach((item, idx) => {
        const url = typeof item === "string" ? item : item?.url;
        const caption = typeof item === "object" ? item?.caption || item?.title : "";
        const type =
          item?.type ||
          (url?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? "video" : "image");
        if (url) {
          list.push({
            id: `media-${idx}`,
            type,
            url,
            caption: caption || `Diagnostic Showcase ${idx + 1}`,
          });
        }
      });
    }

    // 2. Check images array
    if (list.length === 0 && Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((url, idx) => {
        if (url) {
          list.push({
            id: `img-${idx}`,
            type: "image",
            url,
            caption: `Diagnostic Equipment ${idx + 1}`,
          });
        }
      });
    }

    // 3. Check single imageUrl / image
    if (list.length === 0 && (data.imageUrl || data.image)) {
      const singleImg = data.imageUrl || data.image;
      if (singleImg) {
        list.push({
          id: "single-img",
          type: "image",
          url: singleImg,
          caption: "Precision Diagnostic Platform",
        });
      }
    }

    // 4. Check videos array
    if (Array.isArray(data.videos) && data.videos.length > 0) {
      data.videos.forEach((vUrl, idx) => {
        if (vUrl && !list.some((item) => item.url === vUrl)) {
          list.push({
            id: `vid-${idx}`,
            type: "video",
            url: vUrl,
            caption: `Equipment Demonstration ${idx + 1}`,
          });
        }
      });
    }

    // 5. Check single videoUrl
    if (data.videoUrl && !list.some((item) => item.url === data.videoUrl)) {
      list.push({
        id: "single-vid",
        type: "video",
        url: data.videoUrl,
        caption: "Biomedical Technology Tour",
      });
    }

    return list;
  };

  const dbSlides = parseMediaList(homeData);
  const slides = dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES;

  // Hero copy from Firestore
  const heroTitle = homeData?.title?.trim() || "Advanced Biomedical & Diagnostic Equipment Solutions";
  const heroDescription =
    homeData?.description?.trim() ||
    "Delivering precision hematology analyzers, fully automated biochemistry systems, NABL-traceable calibration standards, and 24/7 technical field engineering support across India.";
  const btn1Text = homeData?.button1Text?.trim() || "Explore Equipment";
  const btn2Text = homeData?.button2Text?.trim() || "Get Instant Quote";

  const btn1Href = makeLink("/items");
  const btn2Href = makeLink("/contact");

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length, currentSlide]);

  // Adjust active slide index safely
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(slides.length - 1);
    }
  }, [slides.length, currentSlide]);

  // Play video on current slide
  useEffect(() => {
    const currentMedia = slides[currentSlide];
    if (currentMedia?.type === "video") {
      const vid = videoRefs.current[currentSlide];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  }, [currentSlide, slides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const activeMedia = slides[currentSlide] || slides[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#080d1a] via-[#0f172a] to-[#0f172a] py-10 sm:py-14 lg:py-20 text-white">
      {/* Ambient Lighting Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#3652BA]/25 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-[140px]" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ================= LEFT CONTENT COLUMN ================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Top Location / Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-400/30 bg-slate-900/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200 shadow-md backdrop-blur-md"
            >
              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
              <span>
                {locationTitle
                  ? `Leading Biomedical Supplier in ${locationTitle}`
                  : "Certified Biomedical Equipment & Support"}
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.12] tracking-tight"
            >
              {heroTitle}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xl"
            >
              {heroDescription}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {btn1Text && (
                <Link
                  href={btn1Href}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#3652BA] !text-white px-7 py-3.5 text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:bg-[#283d99] hover:shadow-2xl hover:-translate-y-0.5 border border-indigo-400/30"
                >
                  <span className="!text-white font-bold">{btn1Text}</span>
                  <ArrowRight size={16} className="!text-white" />
                </Link>
              )}

              {btn2Text && (
                <Link
                  href={btn2Href}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700 bg-white/5 !text-white px-7 py-3.5 text-sm font-bold backdrop-blur-md shadow-md transition-all duration-300 hover:bg-white hover:!text-[#0f172a] hover:border-white hover:-translate-y-0.5"
                >
                  <PhoneCall size={16} className="text-indigo-400" />
                  <span className="font-bold">{btn2Text}</span>
                </Link>
              )}
            </motion.div>

            {/* Trust Checklist Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-300"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>ISO 13485 Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>2-Hour Emergency SLA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>NABL Traceable QC</span>
              </div>
            </motion.div>
          </div>

          {/* ================= RIGHT IMAGE MASK CAROUSEL ================= */}
          <div className="lg:col-span-6 relative">
            {/* Outer Glow Effect */}
            <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-[#3652BA] via-indigo-500 to-[#283d99] opacity-30 blur-xl transition-all duration-500 group-hover:opacity-60" />

            {/* The Image Mask Frame */}
            <div
              className="relative overflow-hidden rounded-[2.5rem] border border-indigo-400/30 bg-slate-900 shadow-2xl shadow-indigo-950/60"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Top Floating Glass Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-2xl bg-slate-950/80 px-3.5 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-md border border-white/15 shadow-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Diagnostic Catalog</span>
              </div>

              {/* Top Right Media Type Badge */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl bg-slate-950/80 px-3 py-1.5 text-[11px] font-bold text-slate-200 backdrop-blur-md border border-white/15 shadow-md">
                {activeMedia?.type === "video" ? (
                  <>
                    <Film size={12} className="text-indigo-400" />
                    <span>Video HD</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={12} className="text-indigo-400" />
                    <span>HD View</span>
                  </>
                )}
              </div>

              {/* Masked Image Viewport */}
              <div className="relative h-[340px] sm:h-[420px] lg:h-[460px] w-full overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 h-full w-full"
                  >
                    {activeMedia?.type === "video" ? (
                      <video
                        ref={(el) => (videoRefs.current[currentSlide] = el)}
                        src={activeMedia.url}
                        className="h-full w-full object-cover object-center"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                      />
                    ) : (
                      <img
                        src={activeMedia?.url}
                        alt={activeMedia?.caption || `Hero Slide ${currentSlide + 1}`}
                        className="h-full w-full object-cover object-center brightness-[0.95] contrast-[1.05]"
                        onError={(e) => {
                          e.target.src = FALLBACK_SLIDES[0].url;
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Gradient for Masked Text & Controls */}
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                {/* Bottom Caption Overlay */}
                {activeMedia?.caption && (
                  <div className="absolute bottom-16 left-5 right-5 z-20">
                    <p className="text-xs sm:text-sm font-bold text-slate-200 drop-shadow-md truncate">
                      {activeMedia.caption}
                    </p>
                  </div>
                )}

                {/* Bottom Bar: Indicators & Controls */}
                <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between">
                  {/* Pagination Dots / Progress */}
                  <div className="flex items-center gap-1.5">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full h-2 ${
                          currentSlide === idx
                            ? "w-7 bg-[#3652BA] shadow-md shadow-[#3652BA]/60"
                            : "w-2 bg-white/40 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Controls (Prev, Pause/Play, Next, Counter) */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Autoplay Pause/Play */}
                    {slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-md border border-white/20 hover:bg-[#3652BA] transition-all shadow-md"
                      >
                        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    )}

                    {/* Prev Button */}
                    <button
                      type="button"
                      onClick={handlePrev}
                      title="Previous Slide"
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-md border border-white/20 hover:bg-[#3652BA] hover:border-[#3652BA] transition-all shadow-md"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Slide Counter */}
                    <span className="rounded-xl bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur-md border border-white/20">
                      {currentSlide + 1} / {slides.length}
                    </span>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={handleNext}
                      title="Next Slide"
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-md border border-white/20 hover:bg-[#3652BA] hover:border-[#3652BA] transition-all shadow-md"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Glass Card */}
            <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl border border-indigo-400/30 bg-slate-900/90 p-3.5 backdrop-blur-md shadow-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3652BA] text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">NABL Calibration</p>
                <p className="text-[10px] text-indigo-200">100% Traceable QC</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
