'use client';

import { useState, useEffect } from 'react';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  label: string;        // "2j 30m" atau "Habis"
  urgency: 'normal' | 'soon' | 'urgent' | 'expired';
}

export function useCountdown(expiredAt: string | null): CountdownResult {
  const calc = (): CountdownResult => {
    if (!expiredAt) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: false, label: '-', urgency: 'normal' };
    }
    const diff = Math.max(0, Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000));
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    const isExpired = diff === 0;

    let label = '';
    if (isExpired) label = 'Habis';
    else if (hours > 0) label = `${hours}j ${minutes}m`;
    else if (minutes > 0) label = `${minutes}m ${seconds}d`;
    else label = `${seconds}d`;

    let urgency: CountdownResult['urgency'] = 'normal';
    if (isExpired) urgency = 'expired';
    else if (diff <= 600) urgency = 'urgent';   // <= 10 menit
    else if (diff <= 1800) urgency = 'soon';    // <= 30 menit

    return { hours, minutes, seconds, totalSeconds: diff, isExpired, label, urgency };
  };

  const [result, setResult] = useState<CountdownResult>(calc);

  useEffect(() => {
    if (!expiredAt) return;
    const interval = setInterval(() => setResult(calc()), 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiredAt]);

  return result;
}