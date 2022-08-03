import React, { useEffect } from "react";

import { GetServerSideProps, NextPage } from "next";
import { getAuthSession } from "../../../server/lib/get-server-session";

import { trpc } from "../../../utils/trpc";
import { useRouter } from "next/router";
import { StyledTypography } from "../../../components/styledComponents";
import EventTypeForm from "../../../components/admin/EventTypeForm";

const NewEventType: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const saveEventType = trpc.useMutation(["event-type.save"], {
    onSuccess(data) {
      utils.invalidateQueries(["event-type.getAll"]);
    },
  });

  useEffect(() => {
    if (saveEventType.isSuccess) {
      router.push("/admin");
    }
  }, [router, saveEventType.isSuccess]);

  return (
    <>
      <StyledTypography variant="h4">New Event Type</StyledTypography>
      <EventTypeForm
        data={{ name: "", description: "", iconName: "" }}
        isError={saveEventType.isError}
        saveEventType={saveEventType.mutate}
      />
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

export default NewEventType;
