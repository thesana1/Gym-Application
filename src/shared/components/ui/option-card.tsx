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
  <label className={cn('flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3',
    'transition-[transform,background-color,border-color] duration-150 ease-out active:scale-98',
    'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
    checked ? 'border-foreground bg-primary text-primary-foreground' : 'border-border bg-card hover:border-foreground/30')}>
    <input type={type} name={name} checked={checked} onChange={onChange} className="size-5 shrink-0 accent-foreground" />
    <span className="flex flex-col">
      <span className="text-lg font-semibold">{label}</span>
      {help && <span className={cn('text-base', checked ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{help}</span>}
    </span>
  </label>
);
