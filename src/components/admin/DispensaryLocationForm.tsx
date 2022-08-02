import {
  Paper,
  Container,
  Alert,
  TextField,
  Stack,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Grid,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { trpc } from "../../utils/trpc";
import Spinner from "../Spinner";

//TODO: Factor out common zod stuff from client and server
const locationSchema = z.object({
  location: z.object({
    id: z.string().optional(),
    dispensaryId: z.string(),
    name: z.string(),
    address: z.string(),
  }),
  dispensary: z
    .object({
      name: z.string(),
    })
    .optional(),
});

const DispensaryLocationForm = ({
  saveDispensaryLocation,
  isError,
  data,
}: {
  saveDispensaryLocation: (data: z.infer<typeof locationSchema>) => void;
  isError: boolean;
  data: z.infer<typeof locationSchema>;
}) => {
  const router = useRouter();
  const cancel = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const {
    data: dispensaries,
    isError: isFetchError,
    isLoading,
  } = trpc.useQuery(["dispensary.getAll"]);

  const form = useFormik({
    initialValues: data,
    onSubmit: (values, { setSubmitting }) => {
      saveDispensaryLocation(values);
      setSubmitting(false);
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: toFormikValidationSchema(locationSchema),
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
          "& .MuiFormControl-root": { mr: 2, my: 1 },
        }}
      >
        {isError && (
          <Alert sx={{ my: 2 }} severity="error">
            An error occurred while saving.
          </Alert>
        )}
        <input
          type="hidden"
          id="id"
          name="id"
          value={form.values.location.id}
        />
        <input
          type="hidden"
          id="dispensaryId"
          name="dispensaryId"
          value={form.values.location.dispensaryId}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              value={form.values.location.name}
              helperText={form.errors.location?.name as string}
              error={Boolean(form.errors.location?.name)}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              id="location.name"
              name="location.name"
              label="Location Name"
              variant="standard"
              margin="normal"
            />
          </Grid>
          <Grid item xs={8} md={4}>
            {isLoading || !dispensaries ? (
              <Spinner />
            ) : (
              <FormControl fullWidth variant="standard">
                <InputLabel required id="dispensary-select-label">
                  Dispensary
                </InputLabel>
                <Select
                  labelId="dispensary-select-label"
                  id="location.dispensaryId"
                  name="location.dispensaryId"
                  value={form.values.location.dispensaryId ?? ""}
                  error={Boolean(form.errors.location?.dispensaryId)}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  label="Dispensary"
                >
                  {dispensaries.map((dispensary) => (
                    <MenuItem key={dispensary.id} value={dispensary.id}>
                      {dispensary.name}
                    </MenuItem>
                  ))}
                </Select>
                {Boolean(form.errors.location?.dispensaryId) && (
                  <FormHelperText>
                    {form.errors.location?.dispensaryId}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          </Grid>
          <Grid item xs={4} my="auto" textAlign="center">
            <Button
              onClick={() => {}}
              variant="text"
              size="small"
              color="secondary"
              endIcon={<AddIcon />}
            >
              <Typography variant="overline" fontSize={16}>
                Add New
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              multiline
              rows={4}
              value={form.values.location.address}
              helperText={form.errors.location?.address as string}
              error={Boolean(form.errors.location?.address)}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              id="location.address"
              name="location.address"
              label="Address"
              variant="standard"
              margin="normal"
            />
          </Grid>
          <Grid item xs={8}></Grid>
        </Grid>

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

export default DispensaryLocationForm;
