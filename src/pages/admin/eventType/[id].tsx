import React from "react";
import { useRouter } from "next/router";

const EventTypeForm = () => {
  const router = useRouter();
  const { id } = router.query;
  return <div>EventTypeForm {id}</div>;
};

export default EventTypeForm;
