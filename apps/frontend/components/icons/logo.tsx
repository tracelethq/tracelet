"use client";

import Image from "next/image";

export function Logo() {
  const logoSrc = "/logo.svg";
  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoSrc}
        alt="Tracelet"
        width={40}
        height={40}
        className="object-contain"
      />
      <span className="text-2xl font-bold">Tracelet</span>
    </div>
  );
}
