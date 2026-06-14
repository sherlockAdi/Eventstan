import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Customer submits review after event completion; admin approval required.' })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.reviews.create(dto, request.user.id);
  }

  @Get()
  list() {
    return this.reviews.list(false);
  }

  @Get('admin/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  listForAdmin() {
    return this.reviews.list(true);
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  approve(@Param('id') id: string) {
    return this.reviews.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  reject(@Param('id') id: string) {
    return this.reviews.reject(id);
  }
}
