import { Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/verify')
  toggleVerify(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserVerification(id);
  }

  @Patch('users/:id/block')
  toggleBlock(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserBlock(id);
  }

  @Get('assignments')
  getAssignments() {
    return this.adminService.getAllAssignments();
  }
}
