import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { validateEnv } from './config/env.validation';
import { ExportModule } from './export/export.module';
import { HealthModule } from './health/health.module';
import { MasterModule } from './master/master.module';
import { PrismaModule } from './prisma/prisma.module';
import { TagsModule } from './tags/tags.module';
import { VariantsModule } from './variants/variants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    HealthModule,
    MasterModule,
    VariantsModule,
    TagsModule,
    ExportModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
