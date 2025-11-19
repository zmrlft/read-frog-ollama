import type * as React from 'react'
import { useStore } from '@tanstack/react-form'
import { Field, FieldError, FieldLabel } from '@/components/shadcn/field'
import { Select } from '@/components/shadcn/select'
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

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>
        {label}
      </FieldLabel>
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
      <FieldError
        errors={errors.map(error => ({
          message: typeof error === 'string' ? error : error?.message,
        }))}
      />
    </Field>
  )
}
