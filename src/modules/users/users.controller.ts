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
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { documentUploadOptions } from '../../middleware/upload.middleware';

type UploadedDocumentFile = {
	buffer: Buffer;
	mimetype: string;
};

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req: Request & { user: { id: number } }) {
		return this.usersService.getProfile(req.user.id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('CARE_GIVER')
	@Patch('profile')
	updateProfile(
		@Req() req: Request & { user: { id: number } },
		@Body() dto: UpdateProfileDto,
	) {
		return this.usersService.updateProfile(req.user.id, dto);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('CARE_GIVER')
	@Post('profile/documents')
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'idDocument', maxCount: 1 },
				{ name: 'certDocument', maxCount: 1 },
			],
			documentUploadOptions,
		),
	)
	uploadProfileDocuments(
		@Req() req: Request & { user: { id: number } },
		@UploadedFiles()
		files: {
			idDocument?: UploadedDocumentFile[];
			certDocument?: UploadedDocumentFile[];
		},
	) {
		return this.usersService.uploadProfileDocuments(req.user.id, files);
	}
}
