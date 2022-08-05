import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider, { EmailConfig } from "next-auth/providers/email";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import { theme } from "../../../theme";

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
  // Include user.id and role on token and session
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS,
    updateAge: THIRTY_MINUTES,
  },
  adapter: PrismaAdapter(prisma),
  providers: [EmailProvider(emailOpts)],
  theme: {
    brandColor: theme.palette.primary.main,
    logo: "/images/RoveMulti.svg",
    colorScheme: "light",
  },
};

export default NextAuth(authOptions);
