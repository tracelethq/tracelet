import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AuthState } from "./types"

interface AuthorizationTabProps {
  auth: AuthState
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>
}

export function AuthorizationTab({ auth, setAuth }: AuthorizationTabProps) {
  const update = (updates: Partial<AuthState>) => {
    setAuth((prev) => ({ ...prev, ...updates }))
  }

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <h3 className="text-muted-foreground text-xs font-medium">
        Authorization
      </h3>
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label className="text-xs">Type</Label>
          <Select
            value={auth.type}
            onValueChange={(v) => update({ type: v as AuthState["type"] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">
                No auth
              </SelectItem>
              <SelectItem value="bearer" className="text-xs">
                Bearer Token
              </SelectItem>
              <SelectItem value="basic" className="text-xs">
                Basic Auth
              </SelectItem>
              <SelectItem value="apiKey" className="text-xs">
                API Key
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {auth.type === "bearer" && (
          <div className="grid gap-2">
            <Label className="text-xs">Token</Label>
            <Input
              type="password"
              placeholder="Your token"
              value={auth.bearerToken ?? ""}
              onChange={(e) => update({ bearerToken: e.target.value })}
              className="h-8 font-mono text-xs"
            />
          </div>
        )}

        {auth.type === "basic" && (
          <>
            <div className="grid gap-2">
              <Label className="text-xs">Username</Label>
              <Input
                type="text"
                placeholder="Username"
                value={auth.username ?? ""}
                onChange={(e) => update({ username: e.target.value })}
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                placeholder="Password"
                value={auth.password ?? ""}
                onChange={(e) => update({ password: e.target.value })}
                className="h-8 font-mono text-xs"
              />
            </div>
          </>
        )}

        {auth.type === "apiKey" && (
          <>
            <div className="grid gap-2">
              <Label className="text-xs">Key name (header or query)</Label>
              <Input
                type="text"
                placeholder="X-API-Key"
                value={auth.apiKeyName ?? ""}
                onChange={(e) => update({ apiKeyName: e.target.value })}
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Value</Label>
              <Input
                type="password"
                placeholder="API key value"
                value={auth.apiKeyValue ?? ""}
                onChange={(e) => update({ apiKeyValue: e.target.value })}
                className="h-8 font-mono text-xs"
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
