import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }

  getInfo() {
    return {
      name: 'Tracker API',
      description: 'Enterprise Compliance & Certification Management Platform',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
