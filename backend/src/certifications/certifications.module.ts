import { Module } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CertificationsController } from './certifications.controller';

@Module({
  controllers: [CertificationsController],
  providers: [CertificationsService],
})
export class CertificationsModule {}
