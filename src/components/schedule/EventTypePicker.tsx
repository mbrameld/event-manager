import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Alert, Box, Stack } from "@mui/material";
import Spinner from "../Spinner";

function EventTypePicker({
  selectedType,
  onSelectionChange,
}: {
  selectedType: string | undefined;
  onSelectionChange: (eventType: string) => void;
}) {
  const [availableTypes, loading, error] = [
    ["Staff Education", "Vendor Day"],
    false,
    undefined,
  ]; //TODO

  if (loading || availableTypes.length === 0) return <Spinner />;
  if (error)
    return (
      <Box my={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Stack my={4} direction="row" justifyContent="center">
      <FormControl sx={{ minWidth: 180, maxWidth: 180 }}>
        <InputLabel id="event-type-label">Event Type</InputLabel>
        <Select
          labelId="event-type-label"
          id="event-type-select"
          value={selectedType || ""}
          label="Event Type"
          onChange={(e) => onSelectionChange(e.target.value)}
        >
          {availableTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default EventTypePicker;
