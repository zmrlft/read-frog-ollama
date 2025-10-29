import { Field, FieldError, FieldLabel } from '@repo/ui/components/field'
import { Input } from '@repo/ui/components/input'
import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../form-context'

export function InputField(
  { formForSubmit, label, ...props }:
  { formForSubmit: { handleSubmit: () => void }, label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>,
) {
  const field = useFieldContext<string | undefined>()
  const errors = useStore(field.store, state => state.meta.errors)
  const isValid = useStore(field.store, state => state.meta.isValid)

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>
        {label}
      </FieldLabel>
      <Input
        id={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value)
          void formForSubmit.handleSubmit()
        }}
        aria-invalid={!isValid}
        {...props}
      />
      <FieldError
        errors={errors.map(error => ({
          message: typeof error === 'string' ? error : error?.message,
        }))}
      />
    </Field>
  )
}
