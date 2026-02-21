"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DashboardStats } from "../types";

interface RequestsChartProps {
  stats: DashboardStats;
}

const chartConfig = {
  count: {
    label: "Events",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

function formatHour(hourStr: string): string {
  try {
    let toParse = hourStr;
    if (/^\d{4}-\d{2}-\d{2}T\d{1,2}$/.test(hourStr)) {
      toParse = `${hourStr}:00:00.000Z`;
    }
    const d = new Date(toParse);
    if (Number.isNaN(d.getTime())) return hourStr;
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return hourStr;
  }
}

export function RequestsChart({ stats }: RequestsChartProps) {
  const series = stats.eventsOverTime ?? stats.requestsOverTime ?? [];
  const data = series.map(({ hour, count }) => ({
    name: formatHour(hour),
    count,
    fill: "var(--color-chart-1)",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events over time</CardTitle>
        <p className="text-sm text-muted-foreground">Last 24 hours by hour</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} accessibilityLayer>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-chart-1)"
              fill="url(#fillCount)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
