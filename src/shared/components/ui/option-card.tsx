import { cn } from '@/shared/lib/utils';

type OptionCardProps = {
  type: 'radio' | 'checkbox';
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  help?: string;
};

// A big tappable choice: the whole card is the label for a hidden native input.
export const OptionCard = ({ type, name, checked, onChange, label, help }: OptionCardProps) => (
  <label className={cn('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors',
    'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
    checked ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent')}>
    <input type={type} name={name} checked={checked} onChange={onChange} className="size-5 shrink-0" />
    <span className="flex flex-col">
      <span className="text-lg font-semibold">{label}</span>
      {help && <span className="text-base text-muted-foreground">{help}</span>}
    </span>
  </label>
);
