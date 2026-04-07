import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestAssignmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
