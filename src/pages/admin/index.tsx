import React from "react";
import Ambassadors from "../../components/admin/Ambassadors";
import EventTypes from "../../components/admin/EventTypes";
import Users from "../../components/admin/Users";

import { GetServerSideProps, NextPage } from "next";
import { getAuthSession } from "../../server/lib/get-server-session";
import { Stack } from "@mui/material";
import { Role } from "@prisma/client";

const Admin: NextPage = () => {
  return (
    <Stack direction="column" spacing={4}>
      <Ambassadors />
      <EventTypes />
      <Users />
    </Stack>
  );
};

// There is a session prop configured on pageProps in _app.tsx.
// This ensures it is set before rendering on the client, so we
// don't have to check the status for loading.
// The middleware protects this page from unauthenticated access, so we
// don't have to check the status for authenticated.
// If we get into the render method of the page, we can be sure we have a valid sesion
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      session: await getAuthSession(ctx),
    },
  };
};

export default Admin;
