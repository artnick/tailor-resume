import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
bootstrap();
