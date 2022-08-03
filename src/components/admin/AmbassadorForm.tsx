import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";
import React from "react";

const formatTime = (time: number) =>
  `${time > 12 ? time - 12 : time}:00 ${time >= 12 ? "pm" : "am"}`;

export const AmbassadorZod = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  schedules: z
    .array(
      z
        .object({
          startHour: z.number().min(0).max(23).optional(),
          endHour: z.number().min(0).max(23).optional(),
        })
        .optional()
    )
    .max(7)
    .optional(),
});

export type AmbassadorZodType = z.infer<typeof AmbassadorZod>;

const AmbassadorForm = ({
  data,
  onSave,
}: {
  data: AmbassadorZodType;
  onSave: (amb: AmbassadorZodType) => void;
}) => {
  const ambassadorForm = useFormik({
    initialValues: {
      id: data?.id,
      name: data?.name,
      email: data?.email,
      schedules: data?.schedules,
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: toFormikValidationSchema(AmbassadorZod),
    onSubmit: onSave,
  });

  return (
    <Container
      maxWidth="md"
      component="form"
      onSubmit={ambassadorForm.handleSubmit}
    >
      <input type="hidden" id="id" name="id" value={ambassadorForm.values.id} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} px={4}>
          <TextField
            fullWidth
            value={ambassadorForm.values.name}
            helperText={ambassadorForm.errors.name as string}
            error={ambassadorForm.errors.name !== undefined}
            onChange={ambassadorForm.handleChange}
            onBlur={ambassadorForm.handleBlur}
            id="name"
            name="name"
            label="Name"
            variant="standard"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6} px={4}>
          <TextField
            fullWidth
            value={ambassadorForm.values.email}
            helperText={ambassadorForm.errors.email as string}
            error={ambassadorForm.errors.email !== undefined}
            onChange={ambassadorForm.handleChange}
            onBlur={ambassadorForm.handleBlur}
            id="email"
            name="email"
            label="Email"
            variant="standard"
            margin="normal"
          />
        </Grid>

        {[
          [0, "Sunday"] as const,
          [1, "Monday"] as const,
          [2, "Tuesday"] as const,
          [3, "Wednesday"] as const,
          [4, "Thursday"] as const,
          [5, "Friday"] as const,
          [6, "Saturday"] as const,
        ].map((dayOfWeek) => (
          <>
            <Grid item xs={6} px={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id={`${dayOfWeek[1].toLowerCase()}-start-label`}>
                  {`${dayOfWeek[1]} Start Time`}
                </InputLabel>
                <Select
                  variant="standard"
                  name={`schedules[${dayOfWeek[0]}].startHour`}
                  labelId={`${dayOfWeek[1].toLowerCase()}-start-label`}
                  id={`${dayOfWeek[1].toLowerCase()}-start-select`}
                  label={`${dayOfWeek[1]} Start Time`}
                  onChange={ambassadorForm.handleChange}
                  onBlur={ambassadorForm.handleBlur}
                  value={
                    ambassadorForm.values.schedules?.[dayOfWeek[0]]
                      ?.startHour ?? ""
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {[
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                    17, 18, 19, 20, 21, 22, 23,
                  ].map((startHour) => (
                    <MenuItem key={startHour} value={startHour}>
                      {formatTime(startHour)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} px={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id={`${dayOfWeek[1].toLowerCase()}-end-label`}>
                  {`${dayOfWeek[1]} End Time`}
                </InputLabel>
                <Select
                  variant="standard"
                  name={`schedules[${dayOfWeek[0]}].endHour`}
                  labelId={`${dayOfWeek[1].toLowerCase()}-end-label`}
                  id={`${dayOfWeek[1].toLowerCase()}-end-select`}
                  label={`${dayOfWeek[1]} End Time`}
                  onChange={ambassadorForm.handleChange}
                  onBlur={ambassadorForm.handleBlur}
                  value={
                    ambassadorForm.values.schedules?.[dayOfWeek[0]]?.endHour ??
                    ""
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {[
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                    17, 18, 19, 20, 21, 22, 23,
                  ].map((endHour) => (
                    <MenuItem key={endHour} value={endHour}>
                      {formatTime(endHour)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        ))}
      </Grid>

      <Button autoFocus color="inherit" type="submit">
        save
      </Button>
    </Container>
  );
};

export default AmbassadorForm;
