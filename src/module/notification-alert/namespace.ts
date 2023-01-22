export namespace NotificationAlert {
  export type message = string;
  export type type = "Error" | "Warning" | "Success";
  export type id = string;
  export type durationInMS = number;
  export type header = string | undefined;
}