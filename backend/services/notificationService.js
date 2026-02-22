import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Notification from "../models/Notification.js";

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(String(value));
};

const uniqueObjectIds = (ids = []) => {
  const seen = new Set();
  const normalized = [];

  ids.forEach((id) => {
    const objectId = toObjectId(id);
    if (!objectId) return;
    const key = String(objectId);
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(objectId);
  });

  return normalized;
};

export const createNotification = async ({
  recipientModel,
  recipientId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {},
}) => {
  const normalizedRecipientId = toObjectId(recipientId);
  if (!normalizedRecipientId) return null;

  const normalizedEntityId = toObjectId(entityId);
  return Notification.create({
    recipientModel,
    recipientId: normalizedRecipientId,
    type,
    title,
    message,
    entityType,
    entityId: normalizedEntityId,
    metadata,
  });
};

export const createBulkNotifications = async ({
  recipientModel,
  recipientIds,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {},
}) => {
  const normalizedRecipientIds = uniqueObjectIds(recipientIds);
  if (!normalizedRecipientIds.length) return [];

  const normalizedEntityId = toObjectId(entityId);
  const docs = normalizedRecipientIds.map((id) => ({
    recipientModel,
    recipientId: id,
    type,
    title,
    message,
    entityType,
    entityId: normalizedEntityId,
    metadata,
  }));

  return Notification.insertMany(docs, { ordered: false });
};

export const notifyAdmins = async ({
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {},
}) => {
  const admins = await Admin.find({ active: true }, { _id: 1 }).lean();
  const adminIds = admins.map((admin) => admin._id);

  if (!adminIds.length) return [];

  return createBulkNotifications({
    recipientModel: "Admin",
    recipientIds: adminIds,
    type,
    title,
    message,
    entityType,
    entityId,
    metadata,
  });
};

export const runNotificationTask = async (taskName, handler) => {
  try {
    await handler();
  } catch (error) {
    console.error(`[Notification] ${taskName} failed:`, error.message);
  }
};
