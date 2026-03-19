import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// ตัวอย่างข้อมูล banner สามารถเปลี่ยนเป็น props หรือ fetch จาก API ได้
const banners = [
  {
    id: 1,
    image: 'https://preview.redd.it/new-photos-of-nice-nature-v0-i9p58r2w4h7g1.png?width=640&crop=smart&auto=webp&s=863c90cc093eef0395e645017936f5d91e1fb1c3',
    link: '/games/1',
    alt: 'Test Banner 1',
  },
  {
    id: 2,
    image: 'https://ihearthorses.com/wp-content/uploads/2023/03/chestnut-horse-18.jpg',
    link: '/promotions/2',
    alt: 'Test Banner 2',
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Oguri_Cap_in_Yushun_Stallion_station.jpg/1280px-Oguri_Cap_in_Yushun_Stallion_station.jpg',
    link: '/promotions/3',
    alt: 'Test Banner 3',
  },
  {
    id: 4,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeKOOpLy92UjzQxq8NCxgxOQJbj_YVdfHO_g&s',
    link: '/promotions/4',
    alt: 'Test Banner 4',
  },
  {
    id: 5,
    image: 'https://images.squarespace-cdn.com/content/v1/66ec3b49803ab81bf84f89e4/1737817677564-59EFWG6AUX94VIYYKNII/Flat+Headed+Cat+photo+by+Dr+Jim+Sanderson+AI+background',
    link: '/promotions/5',
    alt: 'Test Banner 5',
  },
  {
    id: 6,
    image: 'https://www.dogster.com/wp-content/uploads/2024/03/Alaskan-Malamute-in-the-snow_Liliya-Kulianionak_Shutterstock.jpg',
    link: '/promotions/6',
    alt: 'Test Banner 6',
  },
  
]

const AUTO_SLIDE_INTERVAL = 6000; // 6 วินาที

const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrent((prev) => prev + 1 > banners.length - 3 ? 0 : prev + 1 );

  const handleClick = (link: string) => {
    router.push(link);
  };

    return (
    <div className="relative w-full overflow-hidden">
        {/* Slider */}
        <div
        className="flex transition-transform duration-500 gap-4"
        style={{
            transform: `translateX(-${current * 33.33}%)`, // show 3 cards
        }}
        >
        {banners.map((banner) => (
            <div
            key={banner.id}
            className="min-w-[33.33%] h-56 md:h-80 relative rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => handleClick(banner.link)}
            >
            {/* Image */}
            <Image
                src={banner.image}
                alt={banner.alt}
                fill
                className="object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Top badge */}
            <div className="absolute top-3 left-3 bg-white/90 text-blue-600 text-xs px-3 py-1 rounded-full">
                เติม UID ทันที
            </div>

            {/* Text */}
            <div className="absolute bottom-4 left-4 text-white">
                <h2 className="font-bold text-lg">
                {banner.alt}
                </h2>
                <p className="text-sm opacity-80">
                6 สินค้า
                </p>
            </div>
            </div>
        ))}
        </div>

        {/* Arrows */}
        <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
        onClick={prev}
        >
        &#8592;
        </button>

        <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
        onClick={next}
        >
        &#8594;
        </button>
    </div>
    );
};

export default BannerSlider;
