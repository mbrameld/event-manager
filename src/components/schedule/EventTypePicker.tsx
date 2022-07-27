import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Alert, Box, Stack } from "@mui/material";
import Spinner from "../Spinner";
import { trpc } from "../../utils/trpc";

function EventTypePicker({
  selectedTypeId,
  onSelectionChange,
}: {
  selectedTypeId: number | undefined;
  onSelectionChange: (eventTypeId: number) => void;
}) {
  const {
    isLoading,
    data: availableTypes,
    error,
  } = trpc.useQuery(["event-type.getAll"]);

  if (isLoading || !availableTypes || availableTypes.length === 0)
    return <Spinner />;
  if (error)
    return (
      <Box my={2}>
        <Alert severity="error">{error.message}</Alert>
      </Box>
    );

  //TODO: Fix that onSelectionChange casting
  return (
    <Stack my={4} direction="row" justifyContent="center">
      <FormControl sx={{ minWidth: 180, maxWidth: 180 }}>
        <InputLabel id="event-type-label">Event Type</InputLabel>
        <Select
          labelId="event-type-label"
          id="event-type-select"
          value={selectedTypeId || ""}
          label="Event Type"
          onChange={(e) => {
            onSelectionChange(parseInt(e.target.value as string));
          }}
        >
          {availableTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default EventTypePicker;
