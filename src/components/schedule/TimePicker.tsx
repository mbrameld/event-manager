import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useMemo } from "react";
import { StyledTypography } from "../styledComponents";

type TimePickerProps = {
  onGoBack: () => void;
  onTimeSelected: (startTime: number) => void;
  availableTimes: number[][];
  selectedDuration: number;
};

const formatTime = (time: number) =>
  `${time > 12 ? time - 12 : time}:00 ${time >= 12 ? "pm" : "am"}`;

export const TimePicker = ({
  onGoBack,
  availableTimes,
  onTimeSelected,
  selectedDuration,
}: TimePickerProps) => {
  const sortedTimesForDuration = useMemo(
    () =>
      Array.from(
        new Set(
          availableTimes.flatMap((freeHours) =>
            freeHours.filter(
              (h, idx) =>
                idx + selectedDuration < freeHours.length &&
                freeHours[idx + selectedDuration - 1] ===
                  h + selectedDuration - 1
            )
          )
        )
      ).sort(),
    [availableTimes, selectedDuration]
  );

  return (
    <>
      <Box position="relative">
        <IconButton
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
          aria-label="go back"
          onClick={onGoBack}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <StyledTypography variant="h5">Select a Time</StyledTypography>
      </Box>
      {sortedTimesForDuration.length > 0 ? (
        <ToggleButtonGroup
          sx={{
            padding: "1rem",
          }}
          orientation="vertical"
          fullWidth
          color="primary"
          exclusive
          onChange={(e, val) => {
            onTimeSelected(val);
          }}
          aria-label="Choose start Time"
        >
          {sortedTimesForDuration.map((startTime) => (
            <ToggleButton
              key={startTime}
              value={startTime}
              aria-label={formatTime(startTime)}
            >
              {formatTime(startTime)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ) : (
        <Typography
          sx={{
            textAlign: "center",
            m: 2,
          }}
        >
          No slots of this duration available. Try another date or a shorter
          event!
        </Typography>
      )}
    </>
  );
};
