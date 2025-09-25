import { JsonObject } from '@/.generated/prisma/client/runtime/library';
import { db } from '@/server/db';
import { NotifyType } from './types/event-feed';

export async function notify({
  receiverId,
  creatorId,
  type,
  message,
  data,
}: {
  receiverId: number;
  creatorId: number;
  type: NotifyType;
  message: string;
  data?: unknown;
}) {
  await db.eventFeed.create({
    data: {
      receiver: { connect: { id: receiverId } },
      createdBy: { connect: { id: creatorId } },
      type,
      message,
      data: data as JsonObject,
    },
  });
}
