import { Router } from "express";
import getProfileData from "./[personalLink].get";

const profile = Router();

profile.get("/:personalLink/", getProfileData);

export default profile;