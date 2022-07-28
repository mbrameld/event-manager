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

const Users = () => {
  const dispensaryUsers = trpc.useQuery(["dispensary-user.getAll"]);

  const utils = trpc.useContext();
  const deleteDispensaryUser = trpc.useMutation(["dispensary-user.delete"], {
    onSuccess(data, variables) {
      utils.invalidateQueries(["dispensary-user.getAll"]);
    },
  });

  const confirm = useConfirm();
  const onDelete = useCallback(
    (dispensaryUserId: string) => {
      confirm({
        cancellationButtonProps: { color: "secondary" },
        title: "Really delete this user?",
        description: "This action cannot be undone!",
        confirmationText: "Yes",
      })
        .then(() => {
          deleteDispensaryUser.mutate({ id: dispensaryUserId });
        })
        .catch(() => {});
    },
    [confirm, deleteDispensaryUser]
  );

  return (
    <Stack>
      <Stack
        mr={1}
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <StyledTypography variant="h4">Dispensary Users</StyledTypography>
        <Link href="/admin/dispensaryUser/new" passHref>
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
      {dispensaryUsers.isLoading && <Spinner />}
      {!dispensaryUsers.isLoading &&
        (!dispensaryUsers.data || dispensaryUsers.data.length === 0) && (
          <StyledTypography m={4} variant="h6">
            No users.
          </StyledTypography>
        )}
      {!dispensaryUsers.isLoading &&
        dispensaryUsers.data &&
        dispensaryUsers.data.length > 0 && (
          <List component={Paper}>
            {dispensaryUsers.data.map((dispensaryUser, idx) => (
              <div key={dispensaryUser.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={2}>
                      <IconButton
                        onClick={() => {
                          onDelete(dispensaryUser.id);
                        }}
                        color="error"
                        edge="end"
                        aria-label="delete event type"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Link
                        href={`/admin/eventTypes/${dispensaryUser.id}`}
                        passHref
                      >
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
                  <ListItemText primary={dispensaryUser.name} />
                </ListItem>
                {idx !== dispensaryUsers.data.length - 1 && (
                  <Divider variant="inset" />
                )}
              </div>
            ))}
          </List>
        )}
    </Stack>
  );
};

export default Users;
