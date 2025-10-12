import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';


export class CreateCustomerDto {
@IsNotEmpty()
@IsString()
name!: string;


@IsNotEmpty()
@IsString()

// 간단한 gender 검증 (M/F)
gender!: string;


@IsNotEmpty()
@IsString()
phone!: string;


@IsOptional()
@IsString()
ageGroup?: string;


@IsOptional()
@IsString()
region?: string;


@IsOptional()
@IsEmail()
email?: string;


@IsOptional()
@IsString()
memo?: string;
}


export class UpdateCustomerDto {
@IsOptional()
@IsString()
name?: string;


@IsOptional()
@IsString()
gender?: string;


@IsOptional()
@IsString()
phone?: string;


@IsOptional()
@IsString()
ageGroup?: string;


@IsOptional()
@IsString()
region?: string;


@IsOptional()
@IsEmail()
email?: string;


@IsOptional()
@IsString()
memo?: string;
}