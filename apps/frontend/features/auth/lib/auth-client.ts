import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { authConfig } from "../config";

export const authClient = createAuthClient({
  baseURL: authConfig.baseURL,
  plugins: [organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
