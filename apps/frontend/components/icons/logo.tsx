"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const logoSrc = "/logo.svg";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src={logoSrc}
        alt="Tracelet"
        width={40}
        height={40}
        className="w-10 h-auto object-contain"
      />
      <span className="text-2xl font-bold">Tracelet</span>
    </div>
  );
}
