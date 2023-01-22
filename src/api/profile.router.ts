import { Router } from "express";
import DB from "../db";

const profile = Router();

profile.get("/:urlToProfile", (req, res, next) => {
  const { urlToProfile } = req.params;
  if (!urlToProfile) next(new Error("1"));

  const user = DB.User.getAll().find(
    (user) => user.urlToProfile === urlToProfile,
  );
  if (!user) next(new Error("2"));

  const { nickname, connectStatus, photoUrl } = user!;

  res.json({nickname, connectStatus, photoUrl});
});

export default profile;
