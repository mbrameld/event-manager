import { Alert, Box } from "@mui/material";
import React, { useCallback, useState } from "react";
import { trpc } from "../../utils/trpc";
import Spinner from "../Spinner";
import { StyledTypography } from "../styledComponents";
import DatePicker from "./DatePicker";
import { TimePicker } from "./TimePicker";

const today = new Date();

function DateTimePicker({
  selectedDuration,
  selectedDate,
  setSelectedDate,
  onStartDateTimeSelected,
}: {
  selectedDuration: number;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
  onStartDateTimeSelected: (startDateTime: Date) => void;
}) {
  const [calendarView, setCalendarView] = useState(
    new Date(today.getFullYear(), today.getMonth())
  );

  const timeSlots = trpc.useQuery([
    "ambassador.getAvailability",
    { month: calendarView },
  ]);

  const onTimeSelected = useCallback(
    (startTime: number) => {
      if (selectedDate) {
        const startDateTime = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          startTime
        );
        onStartDateTimeSelected(startDateTime);
      }
    },
    [selectedDate, onStartDateTimeSelected]
  );

  return (
    <>
      {timeSlots.isError && (
        <Box my={2}>
          <Alert severity="error">{timeSlots.error.message}</Alert>
        </Box>
      )}
      {selectedDate === null ? (
        <DatePicker
          timeSlots={timeSlots.data}
          selectedDuration={selectedDuration}
          calendarView={calendarView}
          setCalendarView={setCalendarView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      ) : (
        <>
          <StyledTypography variant="h4">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </StyledTypography>
          {timeSlots.isLoading || !timeSlots.data ? (
            <Spinner />
          ) : (
            selectedDuration && (
              <TimePicker
                selectedDuration={selectedDuration}
                availableTimes={
                  timeSlots.data.get(selectedDate.getDate()) ?? []
                }
                onGoBack={() => setSelectedDate(null)}
                onTimeSelected={onTimeSelected}
              />
            )
          )}
        </>
      )}
    </>
  );
}

export default DateTimePicker;
