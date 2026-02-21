"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardStats } from "../types";

interface SlowestEndpointsChartProps {
  stats: DashboardStats;
}

export function SlowestEndpointsChart({ stats }: SlowestEndpointsChartProps) {
  const rows = stats.slowestEndpoints ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slowest endpoints</CardTitle>
        <p className="text-sm text-muted-foreground">By avg response time, last 24h (top 10)</p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead className="w-[100px] text-right">Avg (ms)</TableHead>
                <TableHead className="w-[80px] text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={`${r.route}-${i}`}>
                  <TableCell className="max-w-[300px] truncate font-mono text-xs" title={r.route}>
                    {r.route || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">{r.avgDurationMs}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
