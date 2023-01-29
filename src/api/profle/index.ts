import { Router } from "express";
import getProfileData from "./[personalLink].get";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const profile = Router();

profile.get("/:personalLink/", getProfileData);

export default profile;