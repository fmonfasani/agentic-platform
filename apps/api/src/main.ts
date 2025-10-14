import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { apiConfig } from './config/api.config'
import 'reflect-metadata'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: apiConfig.corsOrigins,
    credentials: true
  })

  await app.listen(apiConfig.port)
}

bootstrap()
