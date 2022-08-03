import {
  Paper,
  Container,
  Alert,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

const dispensaryUserSchema = z.object({
  id: z.string().optional(),
  dispensaryId: z.string(),
  name: z.string(),
  email: z.string().email(),
  locationIds: z.array(z.string()),
});

const DispensaryUserForm = ({
  saveDispensaryUser,
  isError,
  data,
}: {
  saveDispensaryUser: (data: z.infer<typeof dispensaryUserSchema>) => void;
  isError: boolean;
  data: z.infer<typeof dispensaryUserSchema>;
}) => {
  const router = useRouter();
  const cancel = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const form = useFormik({
    initialValues: data,
    onSubmit: (values, { setSubmitting }) => {
      saveDispensaryUser(values);
      setSubmitting(false);
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: toFormikValidationSchema(dispensaryUserSchema),
  });
  return (
    <Paper
      sx={{
        p: 1,
      }}
    >
      <Container
        maxWidth="md"
        component="form"
        onSubmit={form.handleSubmit}
        sx={{
          "& .MuiTextField-root": { mr: 1, my: 1 },
        }}
      >
        {isError && (
          <Alert sx={{ my: 2 }} severity="error">
            An error occurred while saving.
          </Alert>
        )}
        <input type="hidden" id="id" name="id" value={form.values.id} />
        <TextField
          required
          value={form.values.name}
          helperText={form.errors.name as string}
          error={Boolean(form.errors.name)}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          id="name"
          name="name"
          label="Name"
          variant="standard"
          margin="normal"
        />
        <TextField
          required
          value={form.values.email}
          helperText={form.errors.email as string}
          error={Boolean(form.errors.email)}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          id="email"
          name="email"
          label="Email"
          type="email"
          variant="standard"
          margin="normal"
        />
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
        >
          <Button
            autoFocus
            color="secondary"
            disabled={form.isSubmitting}
            onClick={cancel}
          >
            cancel
          </Button>
          <Button
            autoFocus
            color="primary"
            type="submit"
            disabled={form.isSubmitting}
          >
            save
          </Button>
        </Stack>
      </Container>
    </Paper>
  );
};

export default DispensaryUserForm;
