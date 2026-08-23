"use client";

import Image from "next/image";

interface ShowcaseItem {
  name: string;
  priceNgn: number;
  imageUrl: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    name: "Buffalo Tenders",
    priceNgn: 8500,
    imageUrl: "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/575/conversions/1-thumb.webp",
  },
  {
    name: "Creamy Asun",
    priceNgn: 11500,
    imageUrl: "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/401/conversions/Creamy-Asun-thumb.webp",
  },
  {
    name: "Nashville Burger",
    priceNgn: 14000,
    imageUrl:
      "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/542/conversions/NASHVILLE-BURGER-b-copy-thumb.webp",
  },
  {
    name: "Vanilla Shake",
    priceNgn: 8500,
    imageUrl: "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/529/conversions/vanilla-new-copy-thumb.webp",
  },
  {
    name: "Notorious Chick",
    priceNgn: 34000,
    imageUrl: "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/417/conversions/IMG_0504-thumb.webp",
  },
  {
    name: "Shrimp Island",
    priceNgn: 11000,
    imageUrl:
      "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/359/conversions/jays-diner-prawn-night-pasta-thumb.webp",
  },
  {
    name: "Sensation Crepe",
    priceNgn: 7500,
    imageUrl: "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/530/conversions/sensation-copy-thumb.webp",
  },
  {
    name: "Smokey Dog",
    priceNgn: 7500,
    imageUrl: "https://s3.eu-central-1.amazonaws.com/storage.jaysdinerng.com/405/conversions/Smokey-Dog-thumb.webp",
  },
];

function money(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}

export default function FoodShowcase({ onSelect }: { onSelect: (text: string) => void }) {
  // Rendered twice back-to-back so the marquee loop is seamless — the
  // animation moves exactly -50%, i.e. one full copy's width.
  const items = [...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS];

  return (
    <div className="group -mx-6 overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] md:-mx-10">
      <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <button
            key={item.name + i}
            type="button"
            onClick={() => onSelect(`I'd like to order the ${item.name}`)}
            className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-2xl border border-soft bg-surface text-left transition-shadow hover:shadow-[0_4px_16px_rgba(22,22,26,0.08)]"
          >
            <div className="relative aspect-[4/3] w-full bg-surface-soft">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="168px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="px-3 py-2.5">
              <p className="mb-0.5 truncate text-[12.5px] font-medium text-ink">{item.name}</p>
              <p className="font-mono text-[12px] text-primary">{money(item.priceNgn)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}