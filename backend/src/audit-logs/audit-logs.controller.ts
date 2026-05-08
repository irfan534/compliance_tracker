import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Req() req, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.auditLogsService.findAll(req.user.organizationId, skip, take);
  }

  @Get('user')
  async findByUser(@Req() req, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.auditLogsService.findByUser(req.user.id, skip, take);
  }
}
