import {
  Alert,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/CancelTwoTone";
import StoreIcon from "@mui/icons-material/StoreTwoTone";
import SchoolIcon from "@mui/icons-material/SchoolTwoTone";
import { add, format } from "date-fns";
import { useConfirm } from "material-ui-confirm";
import { useCallback, useState } from "react";
import { trpc } from "../../utils/trpc";
import { ScheduledEvent } from "@prisma/client";
import { StyledTypography } from "../styledComponents";

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

  const onCancelEvent = useCallback(
    (se: ScheduledEvent) => {
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
    },
    [confirm, deleteEvent]
  );

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
                    onClick={onCancelEvent(se)}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemIcon>
                {se.eventType === "Vendor Day" ? (
                  <StoreIcon color="primary" />
                ) : (
                  <SchoolIcon color="primary" />
                )}
              </ListItemIcon>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 0, md: 10 }}
              >
                <Stack>
                  <ListItemText
                    primary={se.eventType}
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
                    primary={<Typography>{se.ambassador.name}</Typography>}
                    secondary={
                      <Stack>
                        <Typography>{se.ambassador.email}</Typography>
                        <Typography>Rove Ambassador</Typography>
                      </Stack>
                    }
                  />
                </Stack>
              </Stack>
            </ListItem>
            {idx !== scheduledEvents.data.length - 1 && (
              <Divider variant="inset" />
            )}
          </Box>
        ))}
      </List>
    </Stack>
  ) : null;
};

export default UpcomingEvents;
