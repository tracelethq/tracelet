import { cn } from '@/lib/utils';

const Divider = ({direction = 'horizontal', className}: {direction?: 'horizontal' | 'vertical', className?: string }) => {
  return <div className={cn("bg-border/80", direction === 'horizontal' ? 'w-full h-px' : 'w-px h-full', className)} />;
};

export default Divider;