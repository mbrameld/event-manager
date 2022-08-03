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
  Collapse,
  ListItemButton,
} from "@mui/material";
import Link from "next/link";
import React, { ReactNode, useCallback, useState } from "react";
import { trpc } from "../../utils/trpc";
import AddIcon from "@mui/icons-material/AddCircleTwoTone";
import EditIcon from "@mui/icons-material/EditTwoTone";
import Spinner from "../Spinner";
import { StyledTypography } from "../styledComponents";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const ListItemParent = ({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen((o) => !o);
  }, [setOpen]);

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemText primary={text} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {/* <List disablePadding>{children}</List> */}
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
                Add New Location
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

export default Dispensaries;
