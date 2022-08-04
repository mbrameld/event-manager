import React, { ReactNode } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Container, Stack, Typography } from "@mui/material";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
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
        <main>{children}</main>
      </Stack>
    </Container>
  );
};

const Username = () => {
  const { data, status } = useSession();

  if (status === "loading") {
    return null;
  }

  return (
    <Stack direction="row" justifyContent="center" alignItems="center">
      <Typography variant="button">
        {data?.user?.name ?? "Undefined"} (
      </Typography>
      <Link href="/api/auth/signout" color="secondary">
        sign out
      </Link>
      <Typography variant="button">)</Typography>
    </Stack>
  );
};

export default Layout;
