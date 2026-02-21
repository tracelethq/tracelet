"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Rectangle } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DashboardStats } from "../types";

interface ErrorDistributionChartProps {
  stats: DashboardStats;
}

const chartConfig = {
  count: {
    label: "Requests",
  },
  "2xx": {
    label: "Success (2xx)",
    color: "var(--color-chart-1)",
  },
  "4xx": {
    label: "Client error (4xx)",
    color: "var(--color-chart-2)",
  },
  "5xx": {
    label: "Server error (5xx)",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

const BAR_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
];

export function ErrorDistributionChart({ stats }: ErrorDistributionChartProps) {
  const data = (stats.errorDistribution ?? []).map((d, i) => ({
    name: d.label,
    count: d.count,
    fill: BAR_COLORS[i % 3],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error distribution</CardTitle>
        <p className="text-sm text-muted-foreground">2xx vs 4xx vs 5xx (all-time)</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              shape={(props: unknown) => {
                const { payload, ...rest } = (props ?? {}) as {
                  payload?: { fill?: string };
                  [key: string]: unknown;
                };
                return (
                  <Rectangle
                    {...(rest as React.ComponentProps<typeof Rectangle>)}
                    fill={payload?.fill ?? BAR_COLORS[0]}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
