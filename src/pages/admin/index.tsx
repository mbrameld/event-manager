import React, { ReactNode, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getAuthSession } from "../../server/lib/get-server-session";
import { trpc } from "../../utils/trpc";
import { useConfirm } from "material-ui-confirm";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Collapse,
  Dialog,
  Divider,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import EditIcon from "@mui/icons-material/EditTwoTone";
import ExpandLess from "@mui/icons-material/ExpandLessTwoTone";
import ExpandMore from "@mui/icons-material/ExpandMoreTwoTone";
import Spinner from "../../components/Spinner";
import { StyledTypography } from "../../components/styled-components";
import AmbassadorForm, {
  AmbassadorZodType,
} from "../../components/admin/AmbassadorForm";
import SlideUp from "../../components/SlideUp";

const Admin = () => {
  return (
    <>
      <Head>
        <title>Admin - Rove Event Manager</title>
      </Head>
      <Stack direction="column" spacing={4}>
        <Ambassadors />
        <EventTypes />
        <Dispensaries />
      </Stack>
    </>
  );
};

const Ambassadors = () => {
  const ambassadors = trpc.useQuery(["ambassador.getAll"]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const ambassadorIdToEdit = useRef<string | undefined>(undefined);

  const onNewAmbassador = () => {
    ambassadorIdToEdit.current = undefined;
    setDialogOpen(true);
  };

  const handleClose = () => {
    ambassadorIdToEdit.current = undefined;
    setDialogOpen(false);
  };

  const onEditAmbassador = (ambassadorId: string) => {
    ambassadorIdToEdit.current = ambassadorId;
    setDialogOpen(true);
  };

  const utils = trpc.useContext();
  const deleteAmbassador = trpc.useMutation(["ambassador.delete"], {
    onSuccess(data, variables) {
      utils.invalidateQueries(["ambassador.getAll"]);
      utils.invalidateQueries(["ambassador.getById", { id: variables.id }]);
    },
  });

  const confirm = useConfirm();
  const onDelete = (ambassadorId: string) => {
    confirm({
      cancellationButtonProps: { color: "secondary" },
      title: "Really delete the ambassador?",
      description: "This action cannot be undone!",
      confirmationText: "Yes",
    })
      .then(() => {
        deleteAmbassador.mutate({ id: ambassadorId });
      })
      .catch(() => {});
  };

  return (
    <Stack>
      <Stack
        mr={1}
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <StyledTypography variant="h4">Ambassadors</StyledTypography>
        <Button onClick={onNewAmbassador} variant="text">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="overline" fontSize={16}>
              Add New
            </Typography>
            <AddIcon />
          </Stack>
        </Button>
      </Stack>
      {ambassadors.isLoading && <Spinner />}
      {!ambassadors.isLoading &&
        (!ambassadors.data || ambassadors.data.length === 0) && (
          <StyledTypography m={4} variant="h6">
            No ambassadors.
          </StyledTypography>
        )}
      {!ambassadors.isLoading &&
        ambassadors.data &&
        ambassadors.data.length > 0 && (
          <List component={Paper}>
            {ambassadors.data.map((ambassador, idx) => (
              <div key={ambassador.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={2}>
                      <IconButton
                        onClick={() => onDelete(ambassador.id)}
                        color="error"
                        edge="end"
                        aria-label="delete ambassador"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => onEditAmbassador(ambassador.id)}
                        color="primary"
                        edge="end"
                        aria-label="edit ambassador"
                      >
                        <EditIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemText primary={ambassador.name} />
                </ListItem>
                {idx !== ambassadors.data.length - 1 && (
                  <Divider variant="middle" />
                )}
              </div>
            ))}
          </List>
        )}
      <AmbassadorDialog
        open={dialogOpen}
        onClose={handleClose}
        ambassadorId={ambassadorIdToEdit.current}
      />
    </Stack>
  );
};

const AmbassadorDialog = ({
  open,
  onClose,
  ambassadorId,
}: {
  open: boolean;
  onClose: () => void;
  ambassadorId?: string;
}) => {
  const ambassador = trpc.useQuery([
    "ambassador.getById",
    { id: ambassadorId },
  ]);

  const utils = trpc.useContext();
  const saveAmbassador = trpc.useMutation(["ambassador.save"], {
    onSuccess() {
      utils.invalidateQueries(["ambassador.getAll"]);
      utils.invalidateQueries(["ambassador.getById", { id: ambassadorId }]);
      onClose();
    },
  });

  const onSaveAmbassador = (ambassador: AmbassadorZodType) => {
    // This is dumb but with this code here startHour and endHour are always either a number or null
    // If you remove this code they become empty strings instead of nulls. In the input paramater.
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (ambassador.schedules?.[dayOfWeek]) {
        if (
          (ambassador.schedules[dayOfWeek]?.startHour as unknown) === "" ||
          (ambassador.schedules[dayOfWeek]?.endHour as unknown) === ""
        )
          ambassador.schedules[dayOfWeek] = undefined;
      }
    }

    saveAmbassador.mutate({
      ...ambassador,
      schedules: ambassador.schedules as
        | (
            | {
                startHour: number;
                endHour: number;
              }
            | undefined
          )[]
        | undefined,
    });
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <StyledTypography
            color="primary.contrastText"
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
          >
            {!ambassadorId && "New Ambassador"}
          </StyledTypography>
        </Toolbar>
      </AppBar>
      {ambassador.isError && (
        <Box my={2}>
          <Alert severity="error">{ambassador.error.message}</Alert>
        </Box>
      )}
      {ambassador.isLoading || !ambassador.data ? (
        <Spinner />
      ) : (
        <AmbassadorForm data={ambassador.data} onSave={onSaveAmbassador} />
      )}
    </Dialog>
  );
};

const EventTypes = () => {
  const eventTypes = trpc.useQuery(["event-type.getAll"]);

  const utils = trpc.useContext();
  const deleteEventType = trpc.useMutation(["event-type.delete"], {
    onSuccess(data, variables) {
      utils.invalidateQueries(["event-type.getAll"]);
    },
  });

  const confirm = useConfirm();
  const onDelete = (eventTypeId: number) => {
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
  };

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

const ListItemParent = ({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((o) => !o);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemText primary={text} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>{children}</List>
      </Collapse>
    </>
  );
};

const Dispensaries = () => {
  const dispensaries = trpc.useQuery(["dispensary.getAll"]);

  return (
    <Stack>
      <Stack
        mr={1}
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <StyledTypography variant="h4">Dispensaries</StyledTypography>
        <Link href="/admin/dispensary/new" passHref>
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
      {dispensaries.isLoading && <Spinner />}
      {!dispensaries.isLoading &&
        (!dispensaries.data || dispensaries.data.length === 0) && (
          <StyledTypography m={4} variant="h6">
            No dispensaries.
          </StyledTypography>
        )}
      {!dispensaries.isLoading &&
        dispensaries.data !== undefined &&
        dispensaries.data.length > 0 && (
          <List component={Paper}>
            {dispensaries.data.map((dispensary, dIdx) => (
              <div key={dispensary.id}>
                <ListItemParent text={dispensary.name}>
                  {dispensary.locations.map((location, lIdx) => (
                    <div key={location.id}>
                      <ListItem
                        sx={{ pl: 4 }}
                        secondaryAction={
                          <Link
                            href={`/admin/dispensary/${location.id}`}
                            passHref
                          >
                            <IconButton
                              color="primary"
                              edge="end"
                              aria-label="edit dispensary location"
                            >
                              <EditIcon />
                            </IconButton>
                          </Link>
                        }
                      >
                        <ListItemText primary={location.name} />
                      </ListItem>
                      {lIdx !== dispensary.locations.length - 1 && (
                        <Divider variant="middle" />
                      )}
                    </div>
                  ))}
                </ListItemParent>
                {dIdx !== dispensaries.data.length - 1 && (
                  <Divider variant="middle" />
                )}
              </div>
            ))}
          </List>
        )}
    </Stack>
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

export default Admin;
