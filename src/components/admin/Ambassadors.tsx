import {
  Stack,
  Button,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import React, { useCallback, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import EditIcon from "@mui/icons-material/EditTwoTone";
import Spinner from "../Spinner";
import { AmbassadorDialog } from "./AmbassadorDialog";
import { useConfirm } from "material-ui-confirm";
import { StyledTypography } from "../styledComponents";

const Ambassadors = () => {
  const ambassadors = trpc.useQuery(["ambassador.getAll"]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const ambassadorIdToEdit = useRef<string | undefined>(undefined);

  const onNewAmbassador = useCallback(() => {
    ambassadorIdToEdit.current = undefined;
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    ambassadorIdToEdit.current = undefined;
    setDialogOpen(false);
  }, []);

  const onEditAmbassador = useCallback((ambassadorId: string) => {
    ambassadorIdToEdit.current = ambassadorId;
    setDialogOpen(true);
  }, []);

  const utils = trpc.useContext();
  const deleteAmbassador = trpc.useMutation(["ambassador.delete"], {
    onSuccess(data, variables) {
      utils.invalidateQueries(["ambassador.getAll"]);
      utils.invalidateQueries(["ambassador.getById", { id: variables.id }]);
    },
  });

  const confirm = useConfirm();
  const onDelete = useCallback(
    (ambassadorId: string) => {
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
    },
    [confirm, deleteAmbassador]
  );

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
                  <Divider variant="inset" />
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

export default Ambassadors;
