"use client";

import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { ENV_OPTIONS } from "../constants";

export default function EnvWrapper({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const env = params.environment as string;
  const envOption = ENV_OPTIONS.find((e) => e.id === env) ?? { label: "", color: "bg-transparent" };

  return (
    <div className="relative">
      {env && (
        <>
          <span
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[4px] px-2 py-1 text-xs text-white",
              envOption.color
            )}
          >
            {envOption.label}
          </span>
          <div className={cn("absolute top-0 left-0 h-1 w-screen", envOption.color)} />
          {/* <div className={cn("absolute bottom-0 left-0 h-px w-screen", envOption.color)} />
          <div className={cn("absolute top-0 left-0 h-screen w-px", envOption.color)} />
          <div className={cn("absolute bottom-0 right-0 h-screen w-px", envOption.color)} /> */}
        </>
      )}
      {children}
    </div>
  );
}
