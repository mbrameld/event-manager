export const formatTime = (time: number) =>
  `${time > 12 ? time - 12 : time}:00 ${time >= 12 ? "pm" : "am"}`;
