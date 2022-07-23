import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Alert, Box, Stack } from "@mui/material";
import Spinner from "../Spinner";

function EventDurationPicker({
  selectedType,
  selectedDuration,
  onSelectedDurationChange,
}: {
  selectedType: string;
  selectedDuration: number | undefined;
  onSelectedDurationChange: (duration: number) => void;
}) {
  const [availableDurations, loading, error] = [[2, 3, 4, 8], false, undefined]; //TODO

  if (loading) {
    return <Spinner />;
  }

  return (
    <Stack my={4} direction="row" justifyContent="center">
      {error && (
        <Box my={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <ToggleButtonGroup
        value={selectedDuration}
        exclusive
        onChange={(e, value) => onSelectedDurationChange(value)}
        aria-label="Event Duration"
      >
        {availableDurations.map((duration) => (
          <ToggleButton
            key={duration}
            color="primary"
            value={duration}
            aria-label={`${duration} hours`}
            disabled={selectedDuration === duration}
          >
            {duration} hours
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

export default EventDurationPicker;
