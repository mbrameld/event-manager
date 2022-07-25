import React, { ReactNode } from "react";
import Image from "next/image";
import { Container, Stack } from "@mui/material";
import Username from "./Username";

const layout = ({ children }: { children: ReactNode }) => {
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

export default layout;
