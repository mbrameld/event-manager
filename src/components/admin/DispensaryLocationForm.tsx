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
  Link,
  Typography,
  Dialog,
  AppBar,
  Toolbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { trpc } from "../../utils/trpc";
import Spinner from "../Spinner";
import SlideUp from "../SlideUp";
import { StyledTypography } from "../styled-components";

//TODO: Factor out common zod stuff from client and server
const locationSchema = z.object({
  location: z.object({
    id: z.string().optional(),
    dispensaryId: z.string(),
    name: z.string(),
    address: z.string(),
  }),
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
  const onCancel = () => {
    router.push("/admin");
  };

  const {
    data: dispensaries,
    isError: isFetchError,
    isLoading,
  } = trpc.useQuery(["dispensary.getAll"]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = () => {
    setDialogOpen(false);
  };

  const onAddDispensary = () => {
    setDialogOpen(true);
  };

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

  const onDispensarySaved = (newDispensaryId: string) => {
    form.setFieldValue("location.dispensaryId", newDispensaryId);
    setDialogOpen(false);
  };

  return (
    <>
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
            <Grid item xs={4} my="auto" textAlign="center" mb={0.5}>
              <Link
                underline="none"
                variant="overline"
                color="secondary"
                fontSize={16}
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={onAddDispensary}
              >
                <Stack direction="row" spacing={1}>
                  <Typography>Add New</Typography>
                  <AddIcon />
                </Stack>
              </Link>
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
              onClick={onCancel}
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
      <NewDispensaryDialog
        open={dialogOpen}
        onSave={onDispensarySaved}
        onCancel={handleClose}
      />
    </>
  );
};

const NewDispensaryDialog = ({
  open,
  onSave,
  onCancel,
}: {
  open: boolean;
  onSave: (newDispensaryId: string) => void;
  onCancel: () => void;
}) => {
  const utils = trpc.useContext();
  const saveDispensary = trpc.useMutation(["dispensary.saveDispensary"], {
    onSuccess({ id }) {
      utils.invalidateQueries(["dispensary.getAll"]);
      onSave(id);
    },
  });

  const form = useFormik({
    initialValues: { name: "" },
    onSubmit: (values, { setSubmitting, resetForm }) => {
      saveDispensary.mutate(values);
      resetForm();
      setSubmitting(false);
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: toFormikValidationSchema(z.object({ name: z.string() })),
  });

  return (
    <Dialog fullScreen open={open} TransitionComponent={SlideUp}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <StyledTypography
            color="primary.contrastText"
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
          >
            New Dispensary
          </StyledTypography>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="md"
        component="form"
        onSubmit={form.handleSubmit}
        sx={{
          "& .MuiFormControl-root": { mr: 2, my: 1 },
        }}
      >
        {saveDispensary.isError && (
          <Alert sx={{ my: 2 }} severity="error">
            An error occurred while saving: {saveDispensary.error.message}
          </Alert>
        )}
        <TextField
          fullWidth
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
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
        >
          <Button
            autoFocus
            color="secondary"
            disabled={form.isSubmitting}
            onClick={onCancel}
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
    </Dialog>
  );
};

export default DispensaryLocationForm;
