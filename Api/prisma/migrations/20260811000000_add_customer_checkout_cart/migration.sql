-- CreateTable
CREATE TABLE "customer_carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "priceUnit" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_checkouts" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventDate" DATE NOT NULL,
    "eventType" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "message" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "bookingStatus" TEXT NOT NULL DEFAULT 'Pending',
    "subtotal" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_bookings" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "priceUnit" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "eventDate" DATE NOT NULL,
    "eventType" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "message" TEXT,
    "bookingStatus" TEXT NOT NULL DEFAULT 'Pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_carts_userId_key" ON "customer_carts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_cart_items_cartId_packageId_key" ON "customer_cart_items"("cartId", "packageId");

-- CreateIndex
CREATE INDEX "customer_cart_items_userId_idx" ON "customer_cart_items"("userId");

-- CreateIndex
CREATE INDEX "customer_cart_items_packageId_idx" ON "customer_cart_items"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_checkouts_orderId_key" ON "customer_checkouts"("orderId");

-- CreateIndex
CREATE INDEX "customer_checkouts_userId_createdAt_idx" ON "customer_checkouts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_bookings_userId_createdAt_idx" ON "customer_bookings"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_bookings_checkoutId_idx" ON "customer_bookings"("checkoutId");

-- CreateIndex
CREATE INDEX "customer_bookings_packageId_idx" ON "customer_bookings"("packageId");

-- AddForeignKey
ALTER TABLE "customer_carts" ADD CONSTRAINT "customer_carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_cart_items" ADD CONSTRAINT "customer_cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "customer_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_cart_items" ADD CONSTRAINT "customer_cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_cart_items" ADD CONSTRAINT "customer_cart_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "event_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_checkouts" ADD CONSTRAINT "customer_checkouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bookings" ADD CONSTRAINT "customer_bookings_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "customer_checkouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bookings" ADD CONSTRAINT "customer_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bookings" ADD CONSTRAINT "customer_bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "event_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
