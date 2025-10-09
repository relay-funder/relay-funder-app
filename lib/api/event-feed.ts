import { JsonObject } from '@/.generated/prisma/client/runtime/library';
import { db } from '@/server/db';
import { generateMessage, type NotificationData } from '@/lib/notification';
import { normalizeAddress } from '@/lib/normalize-address';
import { ADMIN_ADDRESS } from '@/lib/constant';

export async function notify({
  receiverId,
  creatorId,
  message,
  data,
}: {
  receiverId: number;
  creatorId: number;
  message?: string;
  data: NotificationData;
}) {
  try {
    if (!message) {
      message = generateMessage(data);
    }
    await db.eventFeed.create({
      data: {
        receiver: { connect: { id: receiverId } },
        createdBy: { connect: { id: creatorId } },
        type: data.type,
        message,
        data: data as JsonObject,
      },
    });
  } catch (error) {
    console.error('Failed to notify', { data, error });
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
    });
  } catch (error) {
    console.error('Failed to notifyIntern', { data, error });
  }
}
