import React, { useEffect } from "react";

import { GetServerSideProps, NextPage } from "next";
import { getAuthSession } from "../../../server/lib/get-server-session";
import {
  Alert,
  Box,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { trpc } from "../../../utils/trpc";
import { useRouter } from "next/router";
import { StyledTypography } from "../../../components/styledComponents";

const NewEventType: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const saveEventType = trpc.useMutation(["event-admin.createEventType"], {
    onSuccess() {
      utils.invalidateQueries(["event-admin.getEventTypes"]);
    },
  });

  useEffect(() => {
    if (saveEventType.isSuccess) {
      router.push("/admin");
    }
  }, [saveEventType.isSuccess]);

  const form = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      saveEventType.mutate(values);
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: toFormikValidationSchema(
      z.object({
        name: z.string(),
      })
    ),
  });

  return (
    <>
      <StyledTypography variant="h4">New Event Type</StyledTypography>
      <Paper>
        <Container maxWidth="md" component="form" onSubmit={form.handleSubmit}>
          {saveEventType.isError && (
            <Box my={2}>
              <Alert severity="error">An error occurred while saving.</Alert>
            </Box>
          )}
          <TextField
            fullWidth
            value={form.values.name}
            helperText={form.errors.name as string}
            error={form.errors.name !== undefined}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            id="name"
            name="name"
            label="Event Type Name"
            variant="outlined"
            margin="normal"
          />
          <Stack direction="row" alignItems="baseline">
            <Link href="/admin" passHref>
              <MuiLink underline="none" variant="overline">
                <Typography color="secondary" variant="button">
                  cancel
                </Typography>
              </MuiLink>
            </Link>
            <Button autoFocus color="primary" type="submit">
              save
            </Button>
          </Stack>
        </Container>
      </Paper>
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
