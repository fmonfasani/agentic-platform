// Ensure predictable environment variables for headless CI execution
process.env.NODE_ENV ??= 'test'
process.env.DATABASE_URL ??= 'file:./test.db?connection_limit=1'

// Provide dummy values so services depending on these keys don't fail during tests
process.env.OPENAI_API_KEY ??= 'test-openai-api-key'
process.env.OPENAI_AGENT_MODEL ??= 'gpt-4.1-mini'
process.env.OPENAI_ORG_ID ??= 'test-org'
process.env.OPENAI_PROJECT_ID ??= 'test-project'
