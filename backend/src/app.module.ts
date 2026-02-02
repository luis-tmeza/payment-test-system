import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './infrastructure/modules/products.module';
import { TransactionsModule } from './infrastructure/modules/transactions.module';
import { PaymentsModule } from './infrastructure/modules/payments.module';

@Module({
  imports: [
    // Carga automáticamente el archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a PostgreSQL (Railway)
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      autoLoadEntities: true,
      synchronize: false, // ⚠️ no usar en prod
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    ProductsModule,

    TransactionsModule,

    PaymentsModule,
  ],
})
export class AppModule {}
