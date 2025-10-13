export function migrate(oldConfig: any): any {
  return {
    ...oldConfig,
    tts: {
      providerId: 'openai-default',
      model: 'tts-1',
      voice: 'alloy',
      speed: 1,
    },
  }
}
