import { SetMetadata } from '@nestjs/common';

export const VENDOR_ONBOARDING_BYPASS_KEY = 'vendorOnboardingBypass';

export const VendorOnboardingBypass = () => SetMetadata(VENDOR_ONBOARDING_BYPASS_KEY, true);
