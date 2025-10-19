import { JsonObject } from '@/.generated/prisma/client/runtime/library';
import { db } from '@/server/db';
import { generateMessage, type NotificationData } from '@/lib/notification';
import { normalizeAddress } from '@/lib/normalize-address';
import { ADMIN_ADDRESS } from '@/lib/constant';
import { v4 as uuidv4 } from 'uuid';

export async function notify({
  receiverId,
  creatorId,
  message,
  data,
  eventUuid,
}: {
  receiverId: number;
  creatorId: number;
  message?: string;
  data: NotificationData;
  eventUuid?: string;
}) {
  try {
    const eventMessage =
      typeof message === 'string' ? message : generateMessage(data);
    await db.eventFeed.create({
      data: {
        receiver: { connect: { id: receiverId } },
        createdBy: { connect: { id: creatorId } },
        type: data.type,
        message: eventMessage,
        data: data as JsonObject,
        eventUuid: eventUuid ?? uuidv4(),
      },
    });
  } catch (error) {
    console.error('Failed to notify', { data, error });
  }
}
export async function notifyMany({
  receivers,
  creatorId,
  message,
  data,
}: {
  receivers: number[];
  creatorId: number;
  message?: string;
  data: NotificationData;
}) {
  try {
    const eventUuid = uuidv4();
    const eventMessage =
      typeof message === 'string' ? message : generateMessage(data);
    await db.eventFeed.createMany({
      data: receivers.map((receiverId) => ({
        receiverId,
        createdById: creatorId,
        type: data.type,
        message: eventMessage,
        data: data as JsonObject,
        eventUuid,
      })),
    });
  } catch (error) {
    console.error('Failed to notifyMany', { data, error });
  }
}
export async function notifyIntern({
  creatorId,
  data,
}: {
  creatorId: number;
  data: NotificationData;
}) {
  try {
    const adminUser = await db.user.findUnique({
      where: { address: normalizeAddress(ADMIN_ADDRESS) as string },
    });
    if (!adminUser) {
      return;
    }
    await notify({
      receiverId: adminUser.id,
      creatorId,
      data,
      eventUuid: uuidv4(),
    });
  } catch (error) {
    console.error('Failed to notifyIntern', { data, error });
  }
}
