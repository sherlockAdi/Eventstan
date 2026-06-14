import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me')
  mine(@Req() request: AuthenticatedRequest) {
    return this.notifications.list(request.user.id);
  }

  @Patch(':id/read')
  markRead(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.notifications.markRead(id, request.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  list(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.notifications.list(userId, status);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateNotificationDto) {
    return this.notifications.create(dto);
  }

  @Get('email/health')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  emailHealth() {
    return this.notifications.verifyEmail();
  }

  @Patch(':id/sent')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  markSent(@Param('id') id: string) {
    return this.notifications.markSent(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.notifications.delete(id);
  }
}
