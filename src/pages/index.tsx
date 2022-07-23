import { Stack } from "@mui/material";
import { NextPage } from "next";
import UpcomingEvents from "../components/schedule/UpcomingEvents";
import EventScheduler from "../components/schedule/EventScheduler";
import Spinner from "../components/Spinner";
import { useSession } from "next-auth/react";
import Head from "next/head";

const Schedule: NextPage = () => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>Event Manager</title>
        <meta name="description" content="Event Manager" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session.status === "loading" ? (
        <Spinner />
      ) : (
        <Stack spacing={4}>
          <UpcomingEvents userId={session.data?.user?.id || "Undefined"} />

          <EventScheduler userId={session.data?.user?.id || "Undefined"} />
        </Stack>
      )}
    </>
  );
};

export default Schedule;
