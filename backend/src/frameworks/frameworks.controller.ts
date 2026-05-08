import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FrameworksService } from './frameworks.service';

@Controller('frameworks')
@UseGuards(AuthGuard('jwt'))
export class FrameworksController {
  constructor(private readonly frameworksService: FrameworksService) {}

  @Get()
  async findAll() {
    return this.frameworksService.findAll();
  }

  @Get('organization')
  async getOrganizationFrameworks(@Req() req) {
    return this.frameworksService.getOrganizationFrameworks(req.user.organizationId);
  }

  @Get('metrics')
  async getMetrics(@Req() req) {
    return this.frameworksService.getComplianceMetrics(req.user.organizationId);
  }
}
