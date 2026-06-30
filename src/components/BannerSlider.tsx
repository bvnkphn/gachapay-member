'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Banner {
  id: number
  uuid: string
  image: string
  title?: string
  description?: string
  redirectUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const AUTO_SLIDE = 5000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const MOCK_BANNERS: Banner[] = [
  {
    id: 1,
    uuid: 'mock-1',
    image: '/banner_gacha.png',
    title: 'กิจกรรมสุ่มกาชาพิเศษ',
    description: 'เติมเงินสะสมครบ 1,000 บาท รับสิทธิ์สุ่มกาชาฟรีทันที 1 สิทธิ์!',
    redirectUrl: '/balance',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    uuid: 'mock-2',
    image: '/banner_welcome.png',
    title: 'ยินดีต้อนรับเว็บเปิดใหม่',
    description: 'กรอกโค้ด "WELCOME" เพื่อรับส่วนลดสุดพิเศษ (สำหรับใช้เติมเงินครั้งแรกเท่านั้น)',
    redirectUrl: '/#all-games',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    uuid: 'mock-3',
    image: '/banner_invite.png',
    title: 'แนะนำเพื่อนรับรางวัล',
    description: 'เชิญชวนเพื่อนเข้ามาร่วมสนุกและเติมเงิน รับโบนัสสะสมสูงสุดถึง 100 บาท/คอยน์!',
    redirectUrl: '/invite',
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

// Glow mapping function
const getGlowStyles = (bannerId: number | string) => {
  const idStr = String(bannerId).toLowerCase();
  if (idStr.includes('valorant') || idStr === '1' || idStr.includes('mock-1')) {
    return 'from-red-600/25 via-orange-600/15 to-transparent';
  }
  if (idStr.includes('genshin') || idStr === '2' || idStr.includes('mock-2')) {
    return 'from-cyan-500/20 via-emerald-500/15 to-transparent';
  }
  // Default / Cashback / other
  return 'from-primary/25 via-secondary/15 to-transparent';
};

export default function BannerSlider() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const dragStart = useRef<number | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

  const handleRedirect = (url: string) => {
    setSelectedBanner(null);
    if (url.startsWith("/#") || url.startsWith("#")) {
      const id = url.includes("#") ? url.split("#")[1] : url;
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(url);
      }
    } else {
      router.push(url);
    }
  };

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch banners from backend API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(API_BASE_URL + '/banners')

        if (!response.ok) {
          throw new Error('Failed to fetch: ' + response.statusText)
        }

        const result = await response.json()
        const fetchedBanners = result.data || []
        setBanners(fetchedBanners.length > 0 ? fetchedBanners : MOCK_BANNERS)
      } catch (err) {
        console.error('Error fetching banners:', err)
        // Fallback to mock banners if API fails or empty
        setBanners(MOCK_BANNERS)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  const next = () => {
    if (banners.length === 0) return
    setIndex((i) => (i + 1) % banners.length)
  }

  const prev = () => {
    if (banners.length === 0) return
    setIndex((i) => (i - 1 + banners.length) % banners.length)
  }

  // Auto-slide effect
  useEffect(() => {
    if (banners.length === 0) return

    timerRef.current = setInterval(next, AUTO_SLIDE)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [banners.length, index]) // Reload timer when slide index manually changes to avoid immediate double-slide

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const diff = dragStart.current - e.clientX

    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }

    dragStart.current = null
  }

  return (
    <div className="w-full py-4 flex flex-col items-center">
      {/* Loading state */}
      {loading && (
        <div className="w-full max-w-7xl h-48 sm:h-72 md:h-[24rem] lg:h-[28rem] bg-muted/20 border border-border/30 rounded-2xl flex items-center justify-center shimmer">
          <div className="text-muted-foreground text-sm font-semibold">กำลังโหลดแบนเนอร์กิจกรรม...</div>
        </div>
      )}

      {/* Error / Empty fallback is handled by MOCK_BANNERS so we never show empty state unless explicitly empty */}
      {!loading && banners.length === 0 && (
        <div className="w-full max-w-7xl h-48 sm:h-72 md:h-[24rem] lg:h-[28rem] bg-muted/20 border border-border/30 rounded-2xl flex items-center justify-center">
          <div className="text-muted-foreground text-sm">ไม่มีกิจกรรมในขณะนี้</div>
        </div>
      )}

      {/* Banner slider */}
      {!loading && banners.length > 0 && (
        <div className="w-full relative flex flex-col items-center group/slider px-4 overflow-hidden">
          <div
            className="relative w-full h-48 sm:h-72 md:h-[24rem] lg:h-[28rem] flex items-center justify-center select-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {banners.map((banner, i) => {
              const position =
                i === index
                  ? "center"
                  : i === (index - 1 + banners.length) % banners.length
                    ? "left"
                    : i === (index + 1) % banners.length
                      ? "right"
                      : "hidden"

              const isFirstBanner = i === 0
              const isLastBanner = i === banners.length - 1

              return (
                <div
                  key={banner.uuid}
                  onClick={() => {
                    setSelectedBanner(banner)
                  }}
                  className={cn(
                    "absolute overflow-hidden border select-none transition-all cursor-pointer group",
                    position === "center"
                      ? "border-border/40 hover:border-primary/60 shadow-[0_12px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)] hover:-translate-y-1.5 duration-500 rounded-2xl"
                      : "border-border/20",
                    position === "hidden" && "opacity-0 pointer-events-none",
                    (isFirstBanner || isLastBanner) && "rounded-2xl"
                  )}
                  style={{
                    width: "85%",
                    height: "100%",
                    transform:
                      position === "center"
                        ? "scale(1) translateX(0)"
                        : position === "left"
                          ? "scale(0.85) translateX(-35%)"
                          : position === "right"
                            ? "scale(0.85) translateX(35%)"
                            : "scale(0.75)",
                    opacity: position === "center" ? 1 : position === "hidden" ? 0 : 0.5,
                    zIndex: position === "center" ? 10 : position === "left" ? 8 : position === "right" ? 8 : 5,
                    transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 animate-fade-in"
                  />

                  {/* Text Overlay container */}
                  {(banner.title || banner.description) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-12 text-white pointer-events-none">
                      {banner.title && (
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold mb-1.5 sm:mb-2 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-cyan-400">
                          {banner.title}
                        </h2>
                      )}
                      {banner.description && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-white/90 max-w-[85%] font-medium leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Subtle glassmorphic inner border glare on hover */}
                  <span className="absolute inset-0 border border-white/5 group-hover:border-white/10 rounded-2xl pointer-events-none transition-colors" />
                </div>
              )
            })}

            {/* Desktop Navigation Arrows */}
            {!isMobile && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full backdrop-blur-md z-40 border border-white/10 hover:border-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:bg-primary/95 transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg opacity-0 group-hover/slider:opacity-100 duration-300"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full backdrop-blur-md z-40 border border-white/10 hover:border-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:bg-primary/95 transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg opacity-0 group-hover/slider:opacity-100 duration-300"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicators */}
          <div className="flex justify-center gap-2 mt-5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === index
                    ? "bg-foreground w-6 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                    : "bg-foreground/20 hover:bg-foreground/45"
                )}
                aria-label={"Go to slide " + (i + 1)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Banner Detail Popup Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border/40 overflow-hidden relative animate-in scale-in duration-300">
            {/* Image header */}
            <div className="relative h-44 w-full bg-muted">
              <img src={selectedBanner.image} alt={selectedBanner.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedBanner(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer font-bold w-7 h-7 flex items-center justify-center border-none"
              >
                ✗
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 text-cyan-400">{selectedBanner.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                {selectedBanner.description}
              </p>

              {/* Action buttons based on banner */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedBanner(null)}
                  className="flex-1 py-3 px-4 border border-border text-foreground hover:bg-muted/50 rounded-xl font-semibold transition cursor-pointer"
                >
                  ปิด
                </button>
                {selectedBanner.uuid === 'mock-1' ? (
                  <button
                    onClick={() => {
                      window.dispatchEvent(new Event("open-gacha-modal"));
                      setSelectedBanner(null);
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold transition cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    หมุนวงล้อนำโชค
                  </button>
                ) : selectedBanner.uuid === 'mock-2' ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("WELCOME");
                      toast.success("คัดลอกโค้ดส่วนลด WELCOME เรียบร้อยแล้ว!");
                      handleRedirect(selectedBanner.redirectUrl);
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold transition cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    คัดลอกโค้ดลด 15%
                  </button>
                ) : selectedBanner.redirectUrl ? (
                  <button
                    onClick={() => {
                      handleRedirect(selectedBanner.redirectUrl);
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold transition cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    เข้าร่วมกิจกรรม
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
