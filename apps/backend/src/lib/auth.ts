import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

const baseURL =
  process.env.BETTER_AUTH_BASE_URL ?? process.env.BETTER_AUTH_URL;

const trustedOrigins = (() => {
  const origins = [
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean) : []),
  ].filter((o, i, a) => a.indexOf(o) === i);
  return origins.length ? origins : undefined;
})();

/** Invitation link TTL in seconds (default 48 hours). */
const INVITATION_EXPIRES_IN = 48 * 60 * 60;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: "/api/auth",
  baseURL,
  trustedOrigins,
  plugins: [
    organization({
      creatorRole: "owner",
      membershipLimit: 100,
      invitationExpiresIn: INVITATION_EXPIRES_IN,
      allowUserToCreateOrganization: true,
      sendInvitationEmail: async (data) => {
        const inviteLink = `${baseURL?.replace(/\/$/, "")}/invite/${data.invitation.id}`;
        if (process.env.NODE_ENV !== "test") {
          console.warn(
            "[organization] sendInvitationEmail not configured. Invitation created but email not sent.",
            { email: data.email, organizationId: data.organization.id, inviteLink }
          );
        }
        // TODO: Wire your email provider (e.g. Resend, SendGrid). Example:
        // await sendEmail({ to: data.email, subject: `Invitation to ${data.organization.name}`, body: `Accept: ${inviteLink}` });
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization: org }) => {
          if (process.env.NODE_ENV !== "test") {
            console.info("[organization] Created", { id: org.id, name: org.name, slug: org.slug });
          }
        },
      },
    }),
  ],
});
