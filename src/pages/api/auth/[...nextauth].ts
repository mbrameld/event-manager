import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider, { EmailConfig } from "next-auth/providers/email";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../server/env.mjs";

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const THIRTY_MINUTES = 30 * 60;

const emailOpts: Partial<Omit<EmailConfig, "options">> = {
  server: {
    host: env.EMAIL_SERVER_HOST,
    port: env.EMAIL_SERVER_PORT,
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  },
  from: env.EMAIL_FROM,
};

if (env.NODE_ENV === "development") {
  emailOpts.sendVerificationRequest = ({
    identifier: email,
    url,
    provider: { server, from },
  }) => {
    console.log(url);
  };
}

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS,
    updateAge: THIRTY_MINUTES,
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [EmailProvider(emailOpts)],
};

export default NextAuth(authOptions);
