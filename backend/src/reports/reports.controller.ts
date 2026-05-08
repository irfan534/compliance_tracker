import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('expiry-forecast')
  async getExpiryReport(@Req() req) {
    return this.reportsService.generateExpiryReport(req.user.organizationId);
  }

  @Get('compliance-status')
  async getComplianceReport(@Req() req) {
    return this.reportsService.generateComplianceReport(req.user.organizationId);
  }
}
