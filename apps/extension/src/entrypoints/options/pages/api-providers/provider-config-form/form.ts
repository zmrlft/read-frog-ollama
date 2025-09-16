import { createFormHook, formOptions } from '@tanstack/react-form'
import { apiProviderConfigItemSchema } from '@/types/config/provider'
import { InputField } from './components/input-field'
import { fieldContext, formContext } from './form-context'

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    InputField,
  },
  formComponents: {},
  fieldContext,
  formContext,
})

export const formOpts = formOptions({
  validators: {
    onChange: apiProviderConfigItemSchema,
  },
})
