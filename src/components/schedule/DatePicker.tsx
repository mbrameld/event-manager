import React, { ComponentType, useCallback, useMemo } from "react";

import {
  PickersDay,
  PickersDayProps,
  StaticDatePicker,
} from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { format } from "date-fns";
import { StyledTypography } from "../styledComponents";

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
  const renderCalendarDay = useCallback(
    (
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
    },
    [timeSlots, selectedDuration]
  );

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

  // This is so the StaticDatePicker only rerenders when the day changes.
  const todayDate = new Date();
  const [year, month, date] = [
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
  ];
  const today = useMemo(() => {
    return new Date(year, month, date);
  }, [year, month, date]);

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
        minDate={today}
        onMonthChange={setCalendarView}
        onYearChange={setCalendarView}
        onChange={setSelectedDate}
        renderDay={renderCalendarDay}
        renderInput={(params: any) => <TextField {...params} />}
      />
    </>
  );
}

export default DatePicker;
