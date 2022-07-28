import { Role } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import React from "react";
import { getAuthSession } from "../server/lib/get-server-session";

const rolesToRoutes = new Map([
  [Role.ADMIN, "/admin"],
  [Role.EXECUTIVE, "/admin"],
  [Role.DISPENSARY, "/schedule"],
  [Role.AMBASSADOR, "/admin"],
]);

const Index: NextPage = () => {
  return <div>Index</div>;
};

// There is a session prop configured on pageProps in _app.tsx.
// This ensures it is set before rendering on the client, so we
// don't have to check the status for loading.
// The middleware protects this page from unauthenticated access, so we
// don't have to check the status for authenticated.
// If we get into the render method of the page, we can be sure we have a valid sesion
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getAuthSession(ctx);

  if (!session?.user?.role || session.user.role === Role.UNASSIGNED) {
    return {
      notFound: true, //TODO: Redirect to a page where they can request access
    };
  }

  return {
    redirect: {
      destination: rolesToRoutes.get(session.user.role),
      permanent: false,
    },
    props: {
      session,
    },
  };
};

export default Index;
