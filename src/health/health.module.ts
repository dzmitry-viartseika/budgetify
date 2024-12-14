import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MongoHealthIndicator } from './health/mongo.health';
import { S3HealthIndicator } from './health/s3.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [MongoHealthIndicator, S3HealthIndicator],
})
export class HealthModule {}
