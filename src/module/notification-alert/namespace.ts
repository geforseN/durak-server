export namespace NotificationAlert {
  export type message = string;
  export type type = "Error" | "Warning" | "Success";
  export type id = string;
  export type durationInMS = number;

  export type NotificationAlert = {
    message?: NotificationAlert.message;
    type?: NotificationAlert.type;
    durationInMS?: NotificationAlert.durationInMS;
    id?: NotificationAlert.id;
  }
}

