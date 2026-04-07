import { IsInt, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  assignmentId!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
