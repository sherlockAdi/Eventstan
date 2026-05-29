import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly bookings: BookingsService,
  ) {}

  create(dto: CreateReviewDto) {
    const booking = this.bookings.findOne(dto.bookingId);
    if (booking.status !== 'COMPLETED') throw new BadRequestException('Review is allowed only after event completion');
    if (this.store.reviews.some((item) => item.bookingId === dto.bookingId)) {
      throw new BadRequestException('Only one review is allowed per booking');
    }
    const review = { id: this.store.nextId('rev'), ...dto, status: 'PENDING_APPROVAL', createdAt: new Date().toISOString() };
    this.store.reviews.push(review);
    return review;
  }

  approve(id: string) {
    const review = this.store.reviews.find((item) => item.id === id);
    if (!review) throw new BadRequestException('Review not found');
    review.status = 'PUBLISHED';
    review.approvedAt = new Date().toISOString();
    return review;
  }

  list() {
    return this.store.reviews;
  }
}
