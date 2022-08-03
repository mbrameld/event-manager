import { Paper, Stack } from "@mui/material";
import { add, format } from "date-fns";
import { useConfirm } from "material-ui-confirm";
import React, { useCallback, useState } from "react";
import { trpc } from "../../utils/trpc";
import { StyledTypography } from "../styledComponents";
import DateTimePicker from "./DateTimePicker";
import EventDurationSelect from "./EventDurationPicker";
import EventTypePicker from "./EventTypePicker";

function EventScheduler({ userId }: { userId: string }) {
  const confirm = useConfirm();
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<
    number | undefined
  >(undefined);
  const [selectedDuration, setSelectedDuration] = useState<
    number | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const utils = trpc.useContext();
  const createEvent = trpc.useMutation(["event.create"], {
    onSuccess() {
      utils.invalidateQueries(["ambassador.getAvailability"]);
      utils.invalidateQueries(["event.getAll", { ownerId: userId }]);
    },
  });

  const confirmAndSaveEvent = useCallback(
    (startDateTime: Date) => {
      confirm({
        cancellationButtonProps: { color: "secondary" },
        title: `Confirm your ${selectedDuration} hour long ${selectedEventTypeId}`,
        description: `Starting ${format(
          startDateTime,
          "EEEE MMMM do"
        )} from ${format(startDateTime, "h aa")} until ${format(
          add(startDateTime, { hours: selectedDuration }),
          "h aa"
        )} `,
        confirmationText: "book it",
      })
        .then(() => {
          createEvent.mutate({
            ownerId: userId,
            durationHours: selectedDuration!,
            eventTypeId: selectedEventTypeId!,
            startTime: startDateTime,
          });
          setSelectedDate(null);
        })
        .catch(() => {});
    },
    [confirm, selectedDuration, selectedEventTypeId, createEvent, userId]
  );

  return (
    <Stack>
      <StyledTypography variant="h4">Schedule New Event</StyledTypography>
      <Paper
        sx={{
          paddingBottom: 5,
        }}
      >
        <EventTypePicker
          selectedTypeId={selectedEventTypeId}
          onSelectionChange={setSelectedEventTypeId}
        />
        {selectedEventTypeId && (
          <EventDurationSelect
            selectedDuration={selectedDuration}
            onSelectedDurationChange={setSelectedDuration}
          />
        )}
        {selectedEventTypeId && selectedDuration && (
          <DateTimePicker
            selectedDuration={selectedDuration}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onStartDateTimeSelected={confirmAndSaveEvent}
          />
        )}
      </Paper>
    </Stack>
  );
}

export default EventScheduler;
