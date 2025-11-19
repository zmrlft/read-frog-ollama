import { useStore } from '@tanstack/react-form'
import { Field, FieldError, FieldLabel } from '@/components/shadcn/field'
import { Input } from '@/components/shadcn/input'
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
