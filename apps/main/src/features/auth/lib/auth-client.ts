import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient, apiKeyClient } from "better-auth/client/plugins";
import { authConfig } from "../config";

export const authClient = createAuthClient({
  baseURL: authConfig.baseURL,
  plugins: [
    organizationClient(),
    adminClient(),
    apiKeyClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
