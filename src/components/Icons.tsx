import { ReactNode } from "react";
import StoreIcon from "@mui/icons-material/StoreTwoTone";
import SchoolIcon from "@mui/icons-material/SchoolTwoTone";

export const Icons = new Map<string, ReactNode>([
  ["store", <StoreIcon key="store" color="primary" />],
  ["school", <SchoolIcon key="school" color="primary" />],
]);
