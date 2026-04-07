import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req: Request & { user: { id: number } }) {
		return this.usersService.getProfile(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('profile')
	updateProfile(
		@Req() req: Request & { user: { id: number } },
		@Body() dto: UpdateProfileDto,
	) {
		return this.usersService.updateProfile(req.user.id, dto);
	}
}
