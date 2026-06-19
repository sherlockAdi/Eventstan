import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { HealthModule } from './modules/health/health.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { PackagesModule } from './modules/packages/packages.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ServicesModule } from './modules/services/services.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { SupportModule } from './modules/support/support.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    DashboardModule,
    UsersModule,
    NotificationsModule,
    MasterDataModule,
    VendorsModule,
    ServicesModule,
    PackagesModule,
    AvailabilityModule,
    CartModule,
    BookingsModule,
    PaymentsModule,
    CouponsModule,
    ReviewsModule,
    SettlementsModule,
    SupportModule,
    UploadsModule,
  ],
})
export class AppModule {}
