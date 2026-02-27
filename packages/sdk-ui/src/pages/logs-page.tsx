import { LogsView } from "@/components/logs-view/logs-view";

interface LogsPageProps {
  logsUrl: string;
  token?: string | null;
}

export function LogsPage({ logsUrl, token }: LogsPageProps) {
  return <LogsView logsUrl={logsUrl} token={token} />;
}
