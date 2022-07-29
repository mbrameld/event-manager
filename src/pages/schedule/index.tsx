import { GetServerSideProps, NextPage } from "next";
import UpcomingEvents from "../../components/schedule/UpcomingEvents";
import EventScheduler from "../../components/schedule/EventScheduler";
import { useSession } from "next-auth/react";
import { getAuthSession } from "../../server/lib/get-server-session";
import Head from "next/head";

const Schedule: NextPage = () => {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <>
      <Head>
        <title>Schedule - Rove Event Manager</title>
      </Head>

      <UpcomingEvents userId={session.user?.id || "Undefined"} />

      <EventScheduler userId={session.user?.id || "Undefined"} />
    </>
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

export default Schedule;