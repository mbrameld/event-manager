import React, { useEffect } from "react";

import { GetServerSideProps, NextPage } from "next";
import { getAuthSession } from "../../../server/lib/get-server-session";

import { trpc } from "../../../utils/trpc";
import { useRouter } from "next/router";
import { StyledTypography } from "../../../components/styledComponents";

const NewDispensaryLocation: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const saveDispensaryLocation = trpc.useMutation(["dispensary.saveLocation"], {
    onSuccess(data) {
      utils.invalidateQueries(["dispensary.getAll"]);
    },
  });

  useEffect(() => {
    if (saveDispensaryLocation.isSuccess) {
      router.push("/admin");
    }
  }, [router, saveDispensaryLocation.isSuccess]);

  return (
    <>
      <StyledTypography variant="h4">New Dispensary Location</StyledTypography>
      {/* Form should have
            Dispensary dropdown with option to add new
            name
            address
            users list
        */}

      {/* <DispensaryUserForm
        data={{
          name: "",
          email: "",
          locationIds: [],
          dispensaryId: dispensaryId as string,
        }}
        isError={saveDispensaryLocation.isError}
        saveDispensaryUser={saveDispensaryLocation.mutate}
      /> */}
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

export default NewDispensaryLocation;
