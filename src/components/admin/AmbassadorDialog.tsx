import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, ReactElement, Ref, useCallback } from "react";
import AmbassadorForm, { AmbassadorZodType } from "./AmbassadorForm";
import { Alert, Box } from "@mui/material";
import { trpc } from "../../utils/trpc";
import Spinner from "../Spinner";
import { StyledTypography } from "../styledComponents";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AmbassadorDialog = ({
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

  const saveAmbassadorCallback = useCallback(
    (ambassador: AmbassadorZodType) => {
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
    },
    [saveAmbassador]
  );

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
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
          <StyledTypography sx={{ ml: 2, flex: 1 }} variant="h6">
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
        <AmbassadorForm
          data={ambassador.data}
          onSave={saveAmbassadorCallback}
        />
      )}
    </Dialog>
  );
};
