"use client";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import React from "react";
import { ENV_OPTIONS } from "../store";

const EnvWrapper = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const env = params.environment as string;
  const envOption = ENV_OPTIONS.find((e) => e.id === env)??{label:"",color:"bg-transparent"};
  return (
    <div className="relative">
      {env && (
        <>
        <span className={cn("absolute top-0 left-1/2 -translate-x-1/2 text-xs text-white bg-black px-2 py-1 rounded-b-[4px]", envOption.color)}>{envOption.label}</span>
          <div className={cn("absolute top-0 left-0 w-screen h-px", envOption.color)} />
          <div className={cn("absolute bottom-0 left-0 w-screen h-px", envOption?.color)} />
          <div className={cn("absolute top-0 left-0 w-px h-screen", envOption?.color)} />
          <div className={cn("absolute bottom-0 right-0 w-px h-screen", envOption?.color)} />
        </>
      )}
      {children}
    </div>
  );
};

export default EnvWrapper;
