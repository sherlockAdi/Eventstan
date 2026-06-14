import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        channel: dto.channel,
        event: dto.event,
        recipient: dto.recipient,
        payload: dto.payload as Prisma.InputJsonValue,
      },
    });
  }

  list(userId?: string, status?: string) {
    return this.prisma.notification.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markSent(id: string) {
    await this.get(id);
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'READ' },
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.notification.delete({ where: { id } });
  }

  private async get(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }
}
