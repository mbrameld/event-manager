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
} from "@mui/material";
import StoreIcon from "@mui/icons-material/StoreTwoTone";
import SchoolIcon from "@mui/icons-material/SchoolTwoTone";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

const eventSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  iconName: z.string(),
});

const EventTypeForm = ({
  saveEventType,
  isError,
  data,
}: {
  saveEventType: (data: z.infer<typeof eventSchema>) => void;
  isError: boolean;
  data: z.infer<typeof eventSchema>;
}) => {
  const router = useRouter();
  const cancel = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const form = useFormik({
    initialValues: data,
    onSubmit: (values, { setSubmitting }) => {
      saveEventType(values);
      setSubmitting(false);
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: toFormikValidationSchema(eventSchema),
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
          multiline
          rows={4}
          value={form.values.description}
          helperText={form.errors.description as string}
          error={Boolean(form.errors.description)}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          id="description"
          name="description"
          label="Description"
          variant="standard"
          margin="normal"
        />
        <FormControl fullWidth>
          <InputLabel id="icon-select-label">Icon</InputLabel>
          <Select
            variant="standard"
            labelId="icon-select-label"
            id="icon-select"
            name="iconName"
            value={form.values.iconName}
            error={Boolean(form.errors.iconName)}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            label="Icon"
          >
            <MenuItem value="school">
              <SchoolIcon color="primary" />
            </MenuItem>
            <MenuItem value="store">
              <StoreIcon color="primary" />
            </MenuItem>
          </Select>
          {Boolean(form.errors.iconName) && (
            <FormHelperText>{form.errors.iconName}</FormHelperText>
          )}
        </FormControl>
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

export default EventTypeForm;
