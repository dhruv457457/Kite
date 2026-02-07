'use client';

import { useParams, useRouter } from 'next/navigation';
import { SwapFlow } from '@/components/swap/SwapFlow';
import { ENSProfileCard } from '@/components/profile/ENSProfileCard';
import useENSProfile from '@/hooks/useENSProfile';
import { Button } from '@/components/ui/Button';

export default function SendPage() {
  const params = useParams();
  const router = useRouter();
  const ensname = params.ensname as string;

  // Decode ENS name from URL (handles special characters)
  const decodedName = decodeURIComponent(ensname);

  // Fetch ENS profile
  const { profile, isLoading, error } = useENSProfile(decodedName);

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 min-h-screen">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-8">
        <Button variant="secondary" onClick={handleBack}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-silver rounded-xl p-8 text-center shadow-soft">
            <div className="inline-block w-8 h-8 border-4 border-cyber-yellow border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate">Loading profile...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-silver rounded-xl p-8 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-charcoal font-medium mb-2">Profile Not Found</p>
            <p className="text-sm text-slate mb-4">
              Could not load profile for {decodedName}
            </p>
            <Button onClick={handleBack}>Go Back Home</Button>
          </div>
        </div>
      )}

      {/* Profile Not Configured */}
      {!isLoading && !error && !profile && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-silver rounded-xl p-8 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-yellow/10 border border-cyber-yellow/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-charcoal font-medium mb-2">Profile Not Set Up</p>
            <p className="text-sm text-slate mb-4">
              {decodedName} hasn't configured their Kite profile yet
            </p>
            <Button onClick={handleBack}>Go Back Home</Button>
          </div>
        </div>
      )}

      {/* Swap Flow */}
      {!isLoading && !error && profile && (
        <div className="max-w-6xl mx-auto">
          <SwapFlow
            recipientProfile={profile}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}