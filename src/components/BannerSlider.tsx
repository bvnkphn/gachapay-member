'use client'
import React, { useState, useEffect, useRef } from 'react'

const banners = [
  { id: 1, image: 'https://preview.redd.it/new-photos-of-nice-nature-v0-i9p58r2w4h7g1.png?width=640&crop=smart&auto=webp&s=863c90cc093eef0395e645017936f5d91e1fb1c3', 
    link: '/games/1', 
    alt: 'Test Banner 1' },
  { id: 2, image: 'https://ihearthorses.com/wp-content/uploads/2023/03/chestnut-horse-18.jpg', 
    link: '/promotions/2', 
    alt: 'Test Banner 2' },
  { id: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Oguri_Cap_in_Yushun_Stallion_station.jpg/1280px-Oguri_Cap_in_Yushun_Stallion_station.jpg', 
    link: '/promotions/3', 
    alt: 'Test Banner 3' },
  { id: 4, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeKOOpLy92UjzQxq8NCxgxOQJbj_YVdfHO_g&s', 
    link: '/promotions/4', 
    alt: 'Test Banner 4' },
  { id: 5, image: 'https://images.squarespace-cdn.com/content/v1/66ec3b49803ab81bf84f89e4/1737817677564-59EFWG6AUX94VIYYKNII/Flat+Headed+Cat+photo+by+Dr+Jim+Sanderson+AI+background', 
    link: '/promotions/5', 
    alt: 'Test Banner 5' },
  { id: 6, image: 'https://www.dogster.com/wp-content/uploads/2024/03/Alaskan-Malamute-in-the-snow_Liliya-Kulianionak_Shutterstock.jpg', 
    link: '/promotions/6', 
    alt: 'Test Banner 6' },
]

const AUTO_SLIDE = 5000

export default function BannerSlider() {

  const [index, setIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const dragStart = useRef<number | null>(null)

  const next = () => {
    setIndex((i) => (i + 1) % banners.length)
  }

  const prev = () => {
    setIndex((i) => (i - 1 + banners.length) % banners.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_SLIDE)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

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
    <div className="w-full py-10 flex justify-center">

      <div
        className="relative w-full max-w-6xl h-[22rem] overflow-hidden flex items-center justify-center"
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
              key={banner.id}
              onClick={() => window.location.href = banner.link}
              className="absolute transition-all duration-500 cursor-pointer rounded-2xl overflow-hidden"
              style={{

                width: position === "center" ? "75%" : "35%",
                height: position === "center" ? "100%" : "85%",

                transform:
                  position === "center"
                    ? "translateX(0) scale(1)"
                    : position === "left"
                    ? "translateX(-110%) scale(0.95)"
                    : position === "right"
                    ? "translateX(110%) scale(0.95)"
                    : "scale(0)",

                opacity: position === "hidden" ? 0 : position === "center" ? 1 : 0.6,

                zIndex: position === "center" ? 10 : 5,

                boxShadow:
                  position === "center"
                    ? "0 20px 50px rgba(0,0,0,0.35)"
                    : "0 10px 25px rgba(0,0,0,0.15)",

                transition: "all 0.55s cubic-bezier(0.77,0,0.18,1)"
              }}
            >

              <img
                src={banner.image}
                alt={banner.alt}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1), transparent)"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  background: "rgba(255,255,255,0.9)",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: 11,
                  padding: "4px 12px",
                  borderRadius: 999
                }}
              >
                เติม UID ทันที
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 18,
                  left: 18,
                  color: "#fff"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {banner.alt}
                </div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                  6 สินค้า
                </div>
              </div>

            </div>
          )
        })}

        {/* arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full backdrop-blur-md"
        >
          ‹
        </button>

        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full backdrop-blur-md"
        >
          ›
        </button>

      </div>
    </div>
  )
}