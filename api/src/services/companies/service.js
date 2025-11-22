// services/companies/service.js
import * as repo from "./repository.js";
import { } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function getMainCompanyOfUser(id) {
  const company = await repo.getMainCompanyByUserId(id);
  return company;
};