import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Customer submits review after event completion; admin approval required.' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviews.create(dto);
  }

  @Get()
  list() {
    return this.reviews.list();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.reviews.approve(id);
  }
}
