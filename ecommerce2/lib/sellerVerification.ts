import type { Profile } from '@/lib/types';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'none';

export function getSellerVerification(profile: Profile | null | undefined) {
  if (!profile || profile.role !== 'seller') {
    return { status: 'none' as VerificationStatus, isVerified: false };
  }

  const metadata = profile.metadata as {
    is_verified?: boolean;
    verification_status?: string;
  };

  const isVerified = metadata?.is_verified === true;
  let status: VerificationStatus = 'pending';

  if (metadata?.verification_status === 'approved' || isVerified) {
    status = 'approved';
  } else if (metadata?.verification_status === 'rejected') {
    status = 'rejected';
  } else if (!isVerified) {
    status = 'pending';
  }

  return { status, isVerified: status === 'approved' };
}
