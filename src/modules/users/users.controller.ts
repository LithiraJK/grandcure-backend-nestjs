import {
	Body,
	Controller,
	Get,
	Patch,
	Post,
	Req,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

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

	@UseGuards(JwtAuthGuard)
	@Post('profile/documents')
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'idDocument', maxCount: 1 },
				{ name: 'certDocument', maxCount: 1 },
			],
			{
				storage: multer.memoryStorage(),
				limits: {
					fileSize: 5 * 1024 * 1024,
					files: 2,
				},
			},
		),
	)
	uploadProfileDocuments(
		@Req() req: Request & { user: { id: number } },
		@UploadedFiles()
		files: {
			idDocument?: Express.Multer.File[];
			certDocument?: Express.Multer.File[];
		},
	) {
		return this.usersService.uploadProfileDocuments(req.user.id, files);
	}
}
