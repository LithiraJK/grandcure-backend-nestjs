import { IsDefined, IsEmail, IsString, IsEnum, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export enum RegisterRole {
  PATIENT = 'PATIENT',
  CARE_GIVER = 'CARE_GIVER',
  ADMIN = 'ADMIN',
}

export class RegisterDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsDefined()
  @IsEnum(RegisterRole)
  @IsIn(['PATIENT', 'CARE_GIVER'])
  role!: RegisterRole;
}
