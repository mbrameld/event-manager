import { useState, ComponentType, useMemo, ReactNode } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { getAuthSession } from "../../server/lib/get-server-session";
import { format, add } from "date-fns";
import { trpc } from "../../utils/trpc";
import { useConfirm } from "material-ui-confirm";
import {
  PickersDay,
  PickersDayProps,
  StaticDatePicker,
} from "@mui/x-date-pickers";
import {
  Alert,
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CancelIcon from "@mui/icons-material/CancelTwoTone";
import SchoolIcon from "@mui/icons-material/SchoolTwoTone";
import StoreIcon from "@mui/icons-material/StoreTwoTone";
import Spinner from "../../components/Spinner";
import { StyledTypography } from "../../components/styled-components";
import { formatTime } from "../../lib/time-helpers";

const TODAY = new Date();

const Icons = new Map<string, ReactNode>([
  ["store", <StoreIcon key="store" color="primary" />],
  ["school", <SchoolIcon key="school" color="primary" />],
]);

const Schedule = () => {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <>
      <Head>
        <title>Schedule - Rove Event Manager</title>
      </Head>
      <Stack spacing={4}>
        <UpcomingEvents userId={session.user?.id || "Undefined"} />

        <EventScheduler userId={session.user?.id || "Undefined"} />
      </Stack>
    </>
  );
};

const UpcomingEvents = ({ userId }: { userId: string }) => {
  const confirm = useConfirm();
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);
  const scheduledEvents = trpc.useQuery(["event.getAll", { ownerId: userId }]);
  const utils = trpc.useContext();
  const deleteEvent = trpc.useMutation(["event.delete"], {
    onSuccess() {
      utils.invalidateQueries(["event.getAll", { ownerId: userId }]);
      utils.invalidateQueries(["ambassador.getAvailability"]);
    },
  });

  const onCancelEvent = (se: {
    id: string;
    startTime: Date;
    eventType: string;
  }) => {
    return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      confirm({
        confirmationText: "Yes, cancel it!",
        cancellationText: "No, keep it on the schedule!",
        cancellationButtonProps: { color: "secondary" },
        description: `Really cancel the ${se.eventType} starting ${format(
          se.startTime,
          "EEEE MMM do"
        )} at ${format(se.startTime, "h aa")}?`,
      })
        .then(() => {
          setDeleteError(undefined);
          try {
            deleteEvent.mutate({ id: se.id });
          } catch (error: any) {
            setDeleteError(error);
          }
        })
        .catch(() => {});
    };
  };

  return !scheduledEvents.isLoading &&
    scheduledEvents.data &&
    scheduledEvents.data.length > 0 ? (
    <Stack>
      <StyledTypography variant="h4">Upcoming Events</StyledTypography>
      {scheduledEvents.isError && (
        <Box my={2}>
          <Alert severity="error">{scheduledEvents.error.message}</Alert>
        </Box>
      )}
      {deleteError && (
        <Box my={2}>
          <Alert severity="error">{deleteError}</Alert>
        </Box>
      )}
      <List component={Paper}>
        {scheduledEvents.data.map((se, idx) => (
          <Box key={se.id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <Tooltip title="Cancel Event">
                  <IconButton
                    color="error"
                    edge="end"
                    aria-label="cancel event"
                    onClick={onCancelEvent({
                      id: se.id,
                      startTime: se.startTime,
                      eventType: se.eventType.name,
                    })}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemIcon>{Icons.get(se.eventType.iconName)}</ListItemIcon>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 0, md: 10 }}
              >
                <Stack>
                  <ListItemText
                    primary={se.eventType.name}
                    secondary={`${format(
                      se.startTime,
                      "MMMM d, yyyy"
                    )} from ${format(se.startTime, "h aa")} until ${format(
                      add(se.startTime, { hours: se.durationHours }),
                      "h aa"
                    )}`}
                  />
                  <ListItemText
                    primary={"Cool Gals Dispensary #27"}
                    secondary={"123 Whatever St, Phoenix, AZ 85018"}
                  />
                </Stack>
                <Stack>
                  {/* TODO: Make email link */}
                  <ListItemText
                    primary={<Typography>{se.ambassador.user.name}</Typography>}
                    secondary={
                      <Stack component="span">
                        <Typography component="span">
                          {se.ambassador.user.email}
                        </Typography>
                        <Typography component="span">
                          Rove Ambassador
                        </Typography>
                      </Stack>
                    }
                  />
                </Stack>
              </Stack>
            </ListItem>
            {idx !== scheduledEvents.data.length - 1 && (
              <Divider variant="middle" />
            )}
          </Box>
        ))}
      </List>
    </Stack>
  ) : null;
};

const EventScheduler = ({ userId }: { userId: string }) => {
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

  const confirmAndSaveEvent = (startDateTime: Date) => {
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
  };

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
};

const EventTypePicker = ({
  selectedTypeId,
  onSelectionChange,
}: {
  selectedTypeId: number | undefined;
  onSelectionChange: (eventTypeId: number) => void;
}) => {
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
};

const EventDurationSelect = ({
  selectedDuration,
  onSelectedDurationChange,
}: {
  selectedDuration: number | undefined;
  onSelectedDurationChange: (duration: number) => void;
}) => {
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
};

const DateTimePicker = ({
  selectedDuration,
  selectedDate,
  setSelectedDate,
  onStartDateTimeSelected,
}: {
  selectedDuration: number;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
  onStartDateTimeSelected: (startDateTime: Date) => void;
}) => {
  const [calendarView, setCalendarView] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth())
  );

  const timeSlots = trpc.useQuery([
    "ambassador.getAvailability",
    { month: calendarView },
  ]);

  const onTimeSelected = (startTime: number) => {
    if (selectedDate) {
      const startDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startTime
      );
      onStartDateTimeSelected(startDateTime);
    }
  };

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
};

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== "hasAvailability",
})(({ theme, today, disabled }) => ({
  ...(!disabled && {
    backgroundColor: theme.palette.primary.main,
    borderRadius: "50%",
    color: theme.palette.common.white,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(today &&
    {
      // Add indicator
    }),
})) as ComponentType<PickersDayProps<Date>>;

function DatePicker({
  timeSlots,
  selectedDuration,
  calendarView,
  setCalendarView,
  selectedDate,
  setSelectedDate,
}: {
  timeSlots: Map<number, number[][]> | undefined;
  selectedDuration: number;
  calendarView: Date;
  setCalendarView: (d: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
}) {
  const renderCalendarDay = (
    date: Date,
    selectedDates: Array<Date | null>,
    pickersDayProps: PickersDayProps<Date>
  ) => {
    const hasAvailability =
      selectedDuration &&
      timeSlots &&
      new Set(
        timeSlots
          .get(date.getDate())
          ?.flatMap((freeHours) =>
            freeHours.filter(
              (h, idx) =>
                idx + selectedDuration < freeHours.length &&
                freeHours[idx + selectedDuration - 1] ===
                  h + selectedDuration - 1
            )
          )
      ).size > 0;
    return (
      <CustomPickersDay
        {...pickersDayProps}
        disabled={pickersDayProps.disabled || !hasAvailability}
      />
    );
  };

  const noAvailability = useMemo(
    () =>
      !timeSlots ||
      !Array.from(timeSlots.values()).some((dayOfMonth) => {
        return dayOfMonth.some(
          (hourList) => hourList.length >= selectedDuration
        );
      }),
    [timeSlots, selectedDuration]
  );

  return (
    <>
      <StyledTypography variant="h4">Select a Day</StyledTypography>

      {noAvailability && timeSlots && (
        <StyledTypography color="error" variant="h6">
          No availabliity in {format(calendarView, "MMMM")}
        </StyledTypography>
      )}

      <StaticDatePicker
        defaultCalendarMonth={calendarView}
        disableHighlightToday
        disablePast
        displayStaticWrapperAs="desktop"
        openTo="day"
        value={selectedDate}
        minDate={TODAY}
        onMonthChange={setCalendarView}
        onYearChange={setCalendarView}
        onChange={setSelectedDate}
        renderDay={renderCalendarDay}
        renderInput={(params: any) => <TextField {...params} />}
      />
    </>
  );
}

const TimePicker = ({
  onGoBack,
  availableTimes,
  onTimeSelected,
  selectedDuration,
}: {
  onGoBack: () => void;
  onTimeSelected: (startTime: number) => void;
  availableTimes: number[][];
  selectedDuration: number;
}) => {
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

// There is a session prop configured on pageProps in _app.tsx.
// This ensures it is set before rendering on the client, so we
// don't have to check the status for loading.
// The middleware protects this page from unauthenticated access, so we
// don't have to check the status for authenticated.
// If we get into the render method of the page, we can be sure we have a valid sesion
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      session: await getAuthSession(ctx),
    },
  };
};

export default Schedule;
