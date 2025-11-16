import type * as React from 'react'
import { Field, FieldError, FieldLabel } from '@read-frog/ui/components/field'
import { Select } from '@read-frog/ui/components/select'
import { useStore } from '@tanstack/react-form'
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
