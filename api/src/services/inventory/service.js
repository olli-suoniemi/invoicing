// services/inventory/service.js
import * as repo from "./repository.js";
import { canCreateItem, canReadInventoryItem } from "./policy.js";
import { ForbiddenError } from "../../util/errors.js";

export async function addInventoryItem(user, company, itemData) {
  // check if user can create inventory items
  if (!canCreateItem(user, company)) {
    throw new ForbiddenError('User does not have permission to create inventory items');
  }

  // create inventory item
  const newItem = {
    name: itemData.name,
    ean_code: itemData.ean_code,
    description: itemData.description,
    unit_price: itemData.unit_price,
    tax_rate: itemData.tax_rate,
    company_id: company.org_id,
  };

  console.log('Creating inventory item:', newItem);
  const item = await repo.createInventoryItem(newItem);
  return item;
};

export async function listCompanyInventoryById(id) {
  const inventory = await repo.listCompanyInventoryById(id, 100);
  return inventory;
};

export async function getInventoryItemById(user, company, itemId) {
  // check if user has access to the inventory item
  const item = await repo.getInventoryItemById(itemId);
  if (!item || !canReadInventoryItem(user, company, item)) {
    throw new ForbiddenError('Inventory item not found or access denied');
  }
  return item;
}