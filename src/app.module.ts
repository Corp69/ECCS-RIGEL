import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturacionModule } from './eccs/facturacion/facturacion.module.js';
import { CancelacionesModule } from './eccs/cancelaciones/cancelaciones.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_CLIENT1_HOST'),
        port: Number(configService.getOrThrow<string>('DB_CLIENT1_PORT')),
        username: configService.getOrThrow<string>('DB_CLIENT1_USER'),
        password: configService.getOrThrow<string>('DB_CLIENT1_PASS'),
        database: configService.getOrThrow<string>('DB_CLIENT1_NAME'),
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    //MODULOS
    FacturacionModule,

    CancelacionesModule,


    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    // ObserveModule.forRoot({
    //   appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
    //   appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
    //   serviceId: 'eccs-rigel',
    // }),
  ]
})
export class AppModule {}
