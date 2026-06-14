import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, customerId?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { items: true, reviews: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Review is allowed only after event completion');
    }
    const reviewerId = customerId ?? booking.customerId;
    if (reviewerId !== booking.customerId) throw new BadRequestException('Booking does not belong to this customer');
    if (!booking.items.some((item) => item.vendorId === dto.vendorId)) {
      throw new BadRequestException('Vendor is not part of this booking');
    }
    if (booking.reviews.some((review) => review.customerId === reviewerId)) {
      throw new BadRequestException('Only one review is allowed per booking');
    }

    return this.prisma.review.create({
      data: {
        bookingId: booking.id,
        vendorId: dto.vendorId,
        customerId: reviewerId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async approve(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({
      where: { id },
      data: { status: ReviewStatus.PUBLISHED, approvedAt: new Date() },
    });
  }

  async reject(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({
      where: { id },
      data: { status: ReviewStatus.REJECTED, approvedAt: null },
    });
  }

  async list(includePending = false) {
    const reviews = await this.prisma.review.findMany({
      where: includePending ? {} : { status: ReviewStatus.PUBLISHED },
      include: {
        customer: true,
        booking: { include: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => {
      const bookingItem = review.booking.items.find((item) => item.vendorId === review.vendorId);
      return {
        id: review.id,
        bookingId: review.bookingId,
        vendorId: review.vendorId,
        customerId: review.customerId,
        service_id: bookingItem?.itemId ?? '',
        reviewer_name: review.customer.name,
        reviewer_avatar: '',
        rating: review.rating,
        comment: review.comment,
        event_type: bookingItem?.title ?? 'Event',
        location: review.booking.eventAddress,
        created_at: review.createdAt.toISOString(),
        status: review.status,
      };
    });
  }
}
