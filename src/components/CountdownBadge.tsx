'use client';

import { Clock } from 'lucide-react';
import { useCountdown } from '@/lib/useCountdown';

interface Props {
  expiredAt: string | null;
  size?: 'sm' | 'md';
}

export default function CountdownBadge({ expiredAt, size = 'sm' }: Props) {
  const cd = useCountdown(expiredAt);

  const colorMap = {
    normal: 'bg-black/60 text-white',
    soon: 'bg-amber-500 text-white',
    urgent: 'bg-red-500 text-white animate-pulse',
    expired: 'bg-gray-400 text-white',
  };

  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold ${colorMap[cd.urgency]} ${textSize}`}>
      <Clock size={size === 'md' ? 14 : 10} />
      <span>{cd.label}</span>
    </div>
  );
}