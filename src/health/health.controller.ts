import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { MongoHealthIndicator } from './health/mongo.health';
import { S3HealthIndicator } from './health/s3.health';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';

@ApiTags('health')
@UseGuards(AccessTokenGuard)
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly mongoHealthIndicator: MongoHealthIndicator,
    private readonly s3HealthIndicator: S3HealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      async () => this.mongoHealthIndicator.isHealthy(process.env.DB_URL),
      async () => this.s3HealthIndicator.isHealthy(process.env.AWS_BUCKET_NAME),
    ]);
  }
}
