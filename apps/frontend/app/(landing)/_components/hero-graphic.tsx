"use client";

import * as React from "react";

function getPrimaryColor(): string {
  if (typeof document === "undefined") return "rgb(59, 130, 246)";
  const el = document.createElement("div");
  el.className = "bg-primary";
  el.style.cssText = "position:absolute;opacity:0;pointer-events:none";
  document.body.appendChild(el);
  const color = getComputedStyle(el).backgroundColor;
  document.body.removeChild(el);
  return color || "rgb(59, 130, 246)";
}

function colorWithAlpha(color: string, alpha: number): string {
  const m = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
  const h = color.match(/^#([0-9a-fA-F]{6})$/);
  if (h) {
    const r = parseInt(h[1].slice(0, 2), 16);
    const g = parseInt(h[1].slice(2, 4), 16);
    const b = parseInt(h[1].slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // oklch fallback: use primary-like blue
  return `rgba(59, 130, 246, ${alpha})`;
}

interface Particle {
  progress: number;
  speed: number;
}

export function HeroGraphic() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const lastSpawnRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas.parentElement ?? canvas);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    const primary = getPrimaryColor();

    const spawnParticle = () => {
      const w = W();
      const h = H();
      if (w < 50 || h < 50) return;
      particlesRef.current.push({
        progress: 0,
        speed: 0.006 + Math.random() * 0.004,
      });
    };

    // Get position along flow path (API → Tracelet → Docs) at progress 0..1
    const getFlowPos = (progress: number, width: number, cx: number, cy: number) => {
      const apiX = cx - width * 0.32;
      const traceletX = cx;
      const docsX = cx + width * 0.32;
      if (progress < 0.4) {
        const t = progress / 0.4;
        return { x: apiX + 50 + (traceletX - 55 - (apiX + 50)) * t, y: cy };
      }
      if (progress < 0.7) {
        const t = (progress - 0.4) / 0.3;
        return { x: traceletX - 55 + (traceletX + 55 - (traceletX - 55)) * t, y: cy };
      }
      const t = (progress - 0.7) / 0.3;
      return { x: traceletX + 55 + (docsX - 55 - (traceletX + 55)) * t, y: cy };
    };

    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const now = Date.now() * 0.001;

      // === API routes (left) ===
      const apiX = w * 0.18;
      const apiY = cy;
      const routeLabels = ["GET", "POST", "GET"];
      const routePaths = ["/users", "/orders", "/health"];
      for (let i = 0; i < 3; i++) {
        const y = apiY - 40 + i * 32;
        const boxGrad = ctx.createLinearGradient(apiX - 35, y - 10, apiX + 35, y + 12);
        boxGrad.addColorStop(0, colorWithAlpha(primary, 0.08));
        boxGrad.addColorStop(1, colorWithAlpha(primary, 0.2));
        ctx.fillStyle = boxGrad;
        ctx.fillRect(apiX - 35, y - 10, 70, 22);
        ctx.strokeStyle = primary;
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(now * 2 + i);
        ctx.lineWidth = 1;
        ctx.strokeRect(apiX - 35, y - 10, 70, 22);
        ctx.globalAlpha = 1;
        ctx.fillStyle = primary;
        ctx.globalAlpha = 0.8;
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(routeLabels[i] + " " + routePaths[i], apiX, y + 4);
        ctx.globalAlpha = 1;
      }

      // === Tracelet observer (center) ===
      const traceletX = cx;
      const traceletY = cy;
      const ringRadius = 38 + 5 * Math.sin(now * 1.2);
      const ringPulse = 0.2 + 0.08 * Math.sin(now * 2);
      ctx.beginPath();
      ctx.arc(traceletX, traceletY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = primary;
      ctx.globalAlpha = ringPulse;
      ctx.lineWidth = 2;
      ctx.stroke();
      const innerGradient = ctx.createRadialGradient(
        traceletX, traceletY, 0,
        traceletX, traceletY, ringRadius * 0.6
      );
      innerGradient.addColorStop(0, colorWithAlpha(primary, 0.25));
      innerGradient.addColorStop(1, colorWithAlpha(primary, 0.05));
      ctx.beginPath();
      ctx.arc(traceletX, traceletY, ringRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();
      ctx.strokeStyle = primary;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      // Orbiting dot with glow
      const orbitAngle = now * 1.4;
      const dotX = traceletX + ringRadius * Math.cos(orbitAngle);
      const dotY = traceletY + ringRadius * Math.sin(orbitAngle);
      const dotGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 12);
      dotGlow.addColorStop(0, colorWithAlpha(primary, 0.8));
      dotGlow.addColorStop(0.5, colorWithAlpha(primary, 0.3));
      dotGlow.addColorStop(1, colorWithAlpha(primary, 0));
      ctx.fillStyle = dotGlow;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = primary;
      ctx.fill();
      ctx.font = "9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = primary;
      ctx.globalAlpha = 0.7;
      ctx.fillText("Tracelet", traceletX, traceletY + ringRadius + 18);
      ctx.globalAlpha = 1;

      // === Docs & Logs (right) ===
      const docsX = w * 0.82;
      const docsY = cy - 30;
      const docsGrad = ctx.createLinearGradient(docsX - 40, docsY - 25, docsX + 40, docsY + 10);
      docsGrad.addColorStop(0, colorWithAlpha(primary, 0.1));
      docsGrad.addColorStop(1, colorWithAlpha(primary, 0.25));
      ctx.fillStyle = docsGrad;
      ctx.fillRect(docsX - 40, docsY - 25, 80, 35);
      ctx.strokeStyle = primary;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.strokeRect(docsX - 40, docsY - 25, 80, 35);
      ctx.globalAlpha = 1;
      ctx.font = "9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = primary;
      ctx.globalAlpha = 0.9;
      ctx.fillText("Docs", docsX, docsY-10);
      ctx.fillText("Logs", docsX, docsY);
      ctx.globalAlpha = 1;

      const logsY = cy + 35;
      const logsGrad = ctx.createLinearGradient(docsX - 45, logsY - 12, docsX + 45, logsY + 16);
      logsGrad.addColorStop(0, colorWithAlpha(primary, 0.08));
      logsGrad.addColorStop(1, colorWithAlpha(primary, 0.18));
      ctx.fillStyle = logsGrad;
      ctx.fillRect(docsX - 45, logsY - 12, 90, 28);
      ctx.strokeStyle = primary;
      ctx.globalAlpha = 0.35;
      ctx.strokeRect(docsX - 45, logsY - 12, 90, 28);
      ctx.globalAlpha = 1;
      ctx.font = "8px system-ui, sans-serif";
      ctx.fillStyle = primary;
      ctx.globalAlpha = 0.7;
      ctx.fillText("GET /users 200", docsX, logsY + 4);
      ctx.globalAlpha = 1;

      // === Flow lines with gradient ===
      const flowGradient = ctx.createLinearGradient(apiX, cy, docsX, cy);
      flowGradient.addColorStop(0, colorWithAlpha(primary, 0.1));
      flowGradient.addColorStop(0.5, colorWithAlpha(primary, 0.25));
      flowGradient.addColorStop(1, colorWithAlpha(primary, 0.1));
      ctx.strokeStyle = flowGradient;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(apiX + 50, cy);
      ctx.lineTo(traceletX - 55, cy);
      ctx.lineTo(traceletX + 55, cy);
      ctx.lineTo(docsX - 55, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // === Particles along flow path ===
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const pos = getFlowPos(p.progress, w, cx, cy);

        // Glow trail
        const particleGradient = ctx.createRadialGradient(
          pos.x, pos.y, 0,
          pos.x, pos.y, 10
        );
        particleGradient.addColorStop(0, colorWithAlpha(primary, 0.7));
        particleGradient.addColorStop(0.4, colorWithAlpha(primary, 0.2));
        particleGradient.addColorStop(1, colorWithAlpha(primary, 0));
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = primary;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (now - lastSpawnRef.current > 0.25) {
        lastSpawnRef.current = now;
        spawnParticle();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="relative h-full min-h-[280px] w-full max-w-[420px] sm:min-h-[340px] sm:max-w-[500px]"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: "block" }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
    </div>
  );
}
