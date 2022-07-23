import React from "react";
import { NextPage } from "next";
import Spinner from "../../components/Spinner";
import Ambassadors from "../../components/admin/Ambassadors";
import { useSession } from "next-auth/react";

const Admin: NextPage = () => {
  const { status } = useSession();
  return status === "loading" ? <Spinner /> : <Ambassadors />;
};

export default Admin;
