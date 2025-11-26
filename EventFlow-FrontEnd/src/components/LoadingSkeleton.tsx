import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text' | 'circle';
  count?: number;
}

export default function LoadingSkeleton({ variant = 'card', count = 3 }: LoadingSkeletonProps) {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-6 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-3/4"></div>
        <div className="h-6 w-20 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-full"></div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-full"></div>
        <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-5/6"></div>
      </div>
      <div className="flex gap-4">
        <div className="h-4 w-32 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded"></div>
        <div className="h-4 w-24 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded"></div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center gap-4 animate-pulse">
      <div className="h-12 w-12 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-1/3"></div>
        <div className="h-3 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-2/3"></div>
      </div>
      <div className="h-8 w-24 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded"></div>
    </div>
  );

  const TextSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-full"></div>
      <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-5/6"></div>
      <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-4/6"></div>
    </div>
  );

  const CircleSkeleton = () => (
    <div className="h-10 w-10 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full animate-pulse"></div>
  );

  const getSkeletonComponent = () => {
    switch (variant) {
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'text':
        return <TextSkeleton />;
      case 'circle':
        return <CircleSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{getSkeletonComponent()}</div>
      ))}
    </>
  );
}
