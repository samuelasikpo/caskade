import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  maxAmount: number;
  symbol: string;
  label: string;
}

export function AmountInput({ value, onChange, maxAmount, symbol, label }: AmountInputProps) {
  const handleMax = () => onChange(maxAmount.toString());

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-muted-foreground">
          Balance: {maxAmount.toFixed(4)} {symbol}
        </span>
      </div>
      <div className="relative">
        <Input
          type="number"
          placeholder="0.0000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-20 font-mono text-lg h-12 bg-secondary border-border"
          step="0.0001"
          min="0"
          max={maxAmount}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMax}
            className="h-7 px-2 text-[10px] font-semibold uppercase tracking-wider border-border hover:bg-primary hover:text-primary-foreground"
          >
            Max
          </Button>
        </div>
      </div>
    </div>
  );
}
