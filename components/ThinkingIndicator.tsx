import Image from "next/image";

export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-6 w-6 animate-bounce overflow-hidden rounded-full">
        <Image src="/monei-logo.webp" alt="" fill className="object-cover" />
      </div>
      <span className="text-[13px] text-ink-faint">Thinking...</span>
    </div>
  );
}