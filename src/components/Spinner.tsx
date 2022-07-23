import { CircularProgress, Stack } from "@mui/material";

function Spinner() {
  return (
    <Stack direction={"row"} justifyContent={"center"} my={4}>
      <CircularProgress />
    </Stack>
  );
}

export default Spinner;
