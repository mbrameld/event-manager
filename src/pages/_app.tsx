// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Container, CssBaseline, Stack, ThemeProvider } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import Image from "next/image";
import { theme } from "../theme";
import Username from "../components/Username";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <ConfirmProvider>
          <SessionProvider session={session}>
            <Container disableGutters={true} maxWidth="md">
              <Stack spacing={2} my={2}>
                <Image
                  id="rovelogo"
                  src="/images/RoveMulti.svg"
                  alt="Rove Logo"
                  width="100%"
                  height="100%"
                  objectFit="contain"
                />
                <Username />
                <Component {...pageProps} />
              </Stack>
            </Container>
          </SessionProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
