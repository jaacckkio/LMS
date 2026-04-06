import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function useCountdown(deadline: Date | null): TimeLeft {
  const calculate = (): TimeLeft => {
    if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    const total = deadline.getTime() - Date.now();
    if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      total,
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculate);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return timeLeft;
}
