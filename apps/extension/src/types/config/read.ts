import { z } from 'zod'

export const readConfigSchema = z.object({
  providerName: z.string().nonempty(),
})

export type ReadConfig = z.infer<typeof readConfigSchema>
