import { JsonObject } from '@/.generated/prisma/client/runtime/library';
import { db } from '@/server/db';
import { generateMessage, NotificationData } from '@/lib/notification';

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
}
