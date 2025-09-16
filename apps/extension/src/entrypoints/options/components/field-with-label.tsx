import { cn } from '@repo/ui/lib/utils'

export function FieldWithLabel(
  { id, label, children, className }:
  { id: string, label: React.ReactNode, children: React.ReactNode, className?: string },
) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
