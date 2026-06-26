'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    image: '/banner_valorant.png',
    title: 'VALORANT PROMOTION',
    description: 'รับส่วนลดพิเศษ 20% สำหรับการเติม VP วันนี้!',
    redirectUrl: '/game/valorant',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    uuid: 'mock-2',
    image: '/banner_genshin.png',
    title: 'GENSHIN IMPACT primogems',
    description: 'รับโบนัส Genesis Crystals คูณ 2 สูงสุดทุกแพ็กเกจ!',
    redirectUrl: '/game/genshin-impact',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    uuid: 'mock-3',
    image: '/banner_cashback.png',
    title: 'CYBERPAY CASHBACK',
    description: 'รับเงินคืนสะสมสูงสุด 10% ทุกการเติมเงินผ่านวอลเล็ท!',
    redirectUrl: '/account/balance',
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
        <div className="w-full relative flex flex-col items-center group/slider">
          {/* Cyberpunk Neon Glow Backdrop */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-60 select-none transition-all duration-1000">
            <div 
              className={cn(
                "absolute w-[80%] h-[75%] bg-gradient-to-b blur-[80px] sm:blur-[120px] rounded-full transition-all duration-1000 animate-pulse",
                banners[index] ? getGlowStyles(banners[index].uuid || banners[index].id) : 'from-primary/25 via-secondary/15 to-transparent'
              )} 
              style={{ animationDuration: '6s' }} 
            />
          </div>

          <div
            className="relative w-full max-w-7xl h-48 sm:h-72 md:h-[24rem] lg:h-[28rem] overflow-hidden flex items-center justify-center select-none"
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

              return (
                <div
                  key={banner.uuid}
                  onClick={() => {
                    if (banner.redirectUrl) {
                      router.push(banner.redirectUrl)
                    }
                  }}
                  className={cn(
                    "absolute overflow-hidden border rounded-2xl select-none transition-all cursor-pointer group",
                    position === "center"
                      ? "border-border/40 hover:border-primary/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)] hover:-translate-y-1.5 duration-500"
                      : "border-border/10 opacity-0 pointer-events-none"
                  )}
                  style={{
                    width: "100%",
                    height: "100%",
                    transform:
                      position === "center"
                        ? "scale(1) translateX(0)"
                        : position === "left"
                        ? "scale(0.95) translateX(-100%)"
                        : position === "right"
                        ? "scale(0.95) translateX(100%)"
                        : "scale(0.9)",
                    opacity: position === "center" ? 1 : 0,
                    zIndex: position === "center" ? 10 : 5,
                    transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  
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
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full backdrop-blur-md z-40 border border-white/10 hover:border-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:bg-secondary/95 transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg opacity-0 group-hover/slider:opacity-100 duration-300"
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
    </div>
  )
}
