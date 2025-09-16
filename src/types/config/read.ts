import { z } from 'zod'

export const readConfigSchema = z.object({
  providerId: z.string().nonempty(),
})

export type ReadConfig = z.infer<typeof readConfigSchema>
