import {
  Stack,
  Paper,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React, { useCallback } from "react";
import { trpc } from "../../utils/trpc";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import EditIcon from "@mui/icons-material/EditTwoTone";
import Spinner from "../Spinner";
import { StyledTypography } from "../styledComponents";
import { useConfirm } from "material-ui-confirm";

const EventTypes = () => {
  const eventTypes = trpc.useQuery(["event-type.getAll"]);

  const utils = trpc.useContext();
  const deleteEventType = trpc.useMutation(["event-type.delete"], {
    onSuccess(data, variables) {
      utils.invalidateQueries(["event-type.getAll"]);
    },
  });

  const confirm = useConfirm();
  const onDelete = useCallback(
    (eventTypeId: number) => {
      confirm({
        cancellationButtonProps: { color: "secondary" },
        title: "Really delete the event type?",
        description: "This action cannot be undone!",
        confirmationText: "Yes",
      })
        .then(() => {
          deleteEventType.mutate({ id: eventTypeId });
        })
        .catch(() => {});
    },
    [confirm, deleteEventType]
  );

  return (
    <Stack>
      <Stack
        mr={1}
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <StyledTypography variant="h4">Event Types</StyledTypography>
        <Link href="/admin/eventType/new" passHref>
          <MuiLink underline="none" variant="overline">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="overline" fontSize={16}>
                Add New
              </Typography>
              <AddIcon />
            </Stack>
          </MuiLink>
        </Link>
      </Stack>
      {eventTypes.isLoading && <Spinner />}
      {!eventTypes.isLoading &&
        (!eventTypes.data || eventTypes.data.length === 0) && (
          <StyledTypography m={4} variant="h6">
            No event types.
          </StyledTypography>
        )}
      {!eventTypes.isLoading && eventTypes.data && eventTypes.data.length > 0 && (
        <List component={Paper}>
          {eventTypes.data.map((eventType, idx) => (
            <div key={eventType.id}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      onClick={() => {
                        onDelete(eventType.id);
                      }}
                      color="error"
                      edge="end"
                      aria-label="delete event type"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Link href={`/admin/eventTypes/${eventType.id}`} passHref>
                      <IconButton
                        color="primary"
                        edge="end"
                        aria-label="edit event type"
                      >
                        <EditIcon />
                      </IconButton>
                    </Link>
                  </Stack>
                }
              >
                <ListItemText primary={eventType.name} />
              </ListItem>
              {idx !== eventTypes.data.length - 1 && (
                <Divider variant="middle" />
              )}
            </div>
          ))}
        </List>
      )}
    </Stack>
  );
};

export default EventTypes;
