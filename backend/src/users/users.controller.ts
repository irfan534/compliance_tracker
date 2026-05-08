import { Controller, Get, UseGuards, Req, Body, Put, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Get('organization')
  async getOrganizationUsers(@Req() req) {
    return this.usersService.findAll(req.user.organizationId);
  }
}
