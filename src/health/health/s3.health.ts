import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3HealthIndicator extends HealthIndicator {
  private readonly s3: S3Client;

  constructor() {
    super();
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }

  async isHealthy(bucketName: string): Promise<HealthIndicatorResult> {
    try {
      const command = new HeadBucketCommand({ Bucket: bucketName });
      await this.s3.send(command);

      return this.getStatus(bucketName, true);
    } catch (error) {
      throw new HealthCheckError(
        `S3 healthcheck failed for bucket: ${bucketName}`,
        this.getStatus(bucketName, false, { error: error.message })
      );
    }
  }
}
