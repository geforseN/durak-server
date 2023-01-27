import { NextFunction, Response, Request } from "express";
import { prisma } from "./index";

export default async function getProfileData(req: Request, res: Response, next: NextFunction) {
  const { personalLink } = req.params;
  if (!personalLink) return next(new Error("Не указана ссылка пользователя"));

  const user = await prisma.user.findUnique({ where: { personalLink } });
  if (!user) return next(new Error("Нет доступа")); // На самом деле пользователя может не быть.

  const { nickname, connectStatus, photoUrl } = user;

  res.status(200).json({ nickname, connectStatus, photoUrl });
}
