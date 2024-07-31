export function envConfig() {
  return {
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  };
}

export type EnvConfig = ReturnType<typeof envConfig>;
