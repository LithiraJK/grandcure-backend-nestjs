import { IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RequestAssignmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsDateString()
  date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @IsString()
  @MaxLength(255)
  location!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
