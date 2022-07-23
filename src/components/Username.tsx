import { Button, Stack, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

function Username() {
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
        logout
      </Link>
      <Typography variant="button">)</Typography>
    </Stack>
  );
}

export default Username;
