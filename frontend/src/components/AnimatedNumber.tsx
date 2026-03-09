import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({ value, decimals = 4, prefix = '', suffix = '', className }: AnimatedNumberProps) {
  const display = useAnimatedNumber(value, decimals);
  return <span className={className}>{prefix}{display}{suffix}</span>;
}
