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
import React from "react";
import { trpc } from "../../utils/trpc";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import EditIcon from "@mui/icons-material/EditTwoTone";
import Spinner from "../Spinner";
import { StyledTypography } from "../styledComponents";

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
        dispensaries.data &&
        dispensaries.data.length > 0 && (
          <List component={Paper}>
            {dispensaries.data.map((dispensary, idx) => (
              <div key={dispensary.id}>
                <ListItem
                  secondaryAction={
                    <Link href={`/admin/dispensary/${dispensary.id}`} passHref>
                      <IconButton
                        color="primary"
                        edge="end"
                        aria-label="edit event type"
                      >
                        <EditIcon />
                      </IconButton>
                    </Link>
                  }
                >
                  <ListItemText primary={dispensary.name} />
                </ListItem>
                {idx !== dispensaries.data.length - 1 && (
                  <Divider variant="inset" />
                )}
              </div>
            ))}
          </List>
        )}
    </Stack>
  );
};

export default Dispensaries;
