import Skeleton from '../../Skeleton';
import { theme } from '../../theme';

// Route-level skeleton shown while an exercise page loads (esp. dynamic ones).
export default function Loading() {
  const card = { backgroundColor: theme.background.secondary, border: `1px solid ${theme.border.default}` };
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background.primary }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Skeleton className="h-4 w-48 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-6 mb-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-3" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="rounded-lg p-6" style={card}>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="rounded-lg p-6" style={card}>
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="w-full" style={{ aspectRatio: '16/9' }} />
          </div>
        </div>

        <div className="rounded-lg p-6 mb-8" style={card}>
          <Skeleton className="h-6 w-72 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
