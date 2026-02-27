import type { RouteResponseType } from "@/types/route";
import Decorations from "@/components/ui/decorations";

interface DetailsTabProps {
  responses: RouteResponseType[];
}

export function DetailsTab({ responses }: DetailsTabProps) {
  if (!responses?.length) {
    return (
      <div className="text-muted-foreground rounded-md border border-dashed border-border px-4 py-6 text-center text-xs">
        No response types defined for this route.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 overflow-auto">
      <h3 className="text-muted-foreground text-xs font-medium">
        Response types by status
      </h3>
      {responses.map((res, index) => (
        <div
          key={`${res.status}-${index}`}
          className="border border-border p-px"
        >
          <div className="border-b border-border bg-muted/50 px-3 py-2 flex items-center gap-2 relative">
            <Decorations />
            <span className="font-mono text-xs font-medium">{res.status}</span>
            {res.description && (
              <span className="text-muted-foreground text-xs">
                {res.description}
              </span>
            )}
          </div>
          {res.properties?.length > 0 ? (
            <div className="relative w-full">
              <Decorations />
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="w-[25%] px-3 py-2 text-left font-medium">
                      Property
                    </th>
                    <th className="w-[100px] px-3 py-2 text-left font-medium">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {res.properties.map((prop, i) => (
                    <tr
                      key={`${prop.name}-${i}`}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-3 py-2 font-mono">{prop.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {prop.type}
                        {prop.enum?.length
                          ? ` (${prop.enum.slice(0, 3).join(", ")}${prop.enum.length > 3 ? "…" : ""})`
                          : ""}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {prop.desc ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground px-3 py-4 text-center text-xs">
              No properties
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
