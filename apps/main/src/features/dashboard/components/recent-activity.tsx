"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DashboardStats } from "../types";
import { getProjectPathName } from "@/features/project";

interface RecentActivityProps {
  stats: DashboardStats;
  projectSlug: string;
  env: string;
}

function statusColor(status: number | null): string {
  if (status == null) return "text-muted-foreground";
  if (status >= 200 && status < 300) return "text-emerald-600 dark:text-emerald-400";
  if (status >= 400 && status < 500) return "text-amber-600 dark:text-amber-400";
  if (status >= 500) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RecentActivity({ stats, projectSlug, env }: RecentActivityProps) {
  const logs = stats.recentLogs;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent activity</CardTitle>
          <p className="text-sm text-muted-foreground">Latest HTTP requests</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={getProjectPathName(projectSlug, env, "/logs")}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No requests yet. Send traffic with the Tracelet SDK to see activity.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Method</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[80px]">Duration</TableHead>
                <TableHead className="w-[90px]">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {log.method ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs" title={log.route ?? undefined}>
                    {log.route ?? "—"}
                  </TableCell>
                  <TableCell className={statusColor(log.statusCode)}>
                    {log.statusCode ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.durationMs != null ? `${log.durationMs}ms` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatTime(log.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
