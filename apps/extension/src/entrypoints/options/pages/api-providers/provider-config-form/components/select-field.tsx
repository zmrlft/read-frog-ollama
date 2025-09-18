import type * as React from 'react'
import { Select } from '@repo/ui/components/select'
import { useStore } from '@tanstack/react-form'
import { FieldWithLabel } from '@/entrypoints/options/components/field-with-label'
import { useFieldContext } from '../form-context'

type SelectFieldProps = React.ComponentProps<typeof Select> & {
  formForSubmit: { handleSubmit: () => void }
  label: React.ReactNode
}

export function SelectField(
  { formForSubmit, label, ...props }: SelectFieldProps,
) {
  const field = useFieldContext<string | undefined>()
  const errors = useStore(field.store, state => state.meta.errors)
  const isValid = useStore(field.store, state => state.meta.isValid)

  return (
    <FieldWithLabel
      label={label}
      id={field.name}
    >
      <Select
        value={field.state.value}
        onValueChange={(value: string) => {
          field.handleChange(value)
          void formForSubmit.handleSubmit()
        }}
        {...props}
      >
        {props.children}
      </Select>
      {!isValid && (
        <em id={`${field.name}-error`} className="text-sm text-destructive mt-1">
          {errors.map(error =>
            typeof error === 'string' ? error : error?.message,
          ).join(', ')}
        </em>
      )}
    </FieldWithLabel>
  )
}
