import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Controller('certifications')
@UseGuards(AuthGuard('jwt'))
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Post()
  async create(@Req() req, @Body() createCertificationDto: CreateCertificationDto) {
    return this.certificationsService.create(
      req.user.organizationId,
      req.user.id,
      createCertificationDto,
    );
  }

  @Get()
  async findAll(@Req() req, @Query('skip') skip = 0, @Query('take') take = 20) {
    return this.certificationsService.findAll(req.user.organizationId, skip, take);
  }

  @Get('metrics')
  async getMetrics(@Req() req) {
    return this.certificationsService.getExpiryMetrics(req.user.organizationId);
  }

  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    return this.certificationsService.findById(id, req.user.organizationId);
  }

  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() data: any) {
    return this.certificationsService.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    return this.certificationsService.delete(id, req.user.organizationId);
  }
}
