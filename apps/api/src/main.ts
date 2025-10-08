import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
  await app.listen(port)
}

bootstrap()
