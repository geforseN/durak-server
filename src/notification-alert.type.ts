export type NotificationAlert = {
  message: string;
  type: "Error" | "Warning" | "Success";
  id: string;
  durationInMS: number;
  header?: string | undefined;
}