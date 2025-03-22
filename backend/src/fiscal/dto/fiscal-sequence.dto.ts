import { IsString, IsInt, IsBoolean, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFiscalSequenceDto {
  @IsUUID()
  businessProfileId: string;

  @IsString()
  sequenceType: string;

  @IsString()
  prefix: string;

  @IsInt()
  @Type(() => Number)
  currentNumber: number;

  @IsInt()
  @Type(() => Number)
  endNumber: number;

  @IsBoolean()
  isActive: boolean;

  @IsDateString()
  expirationDate: string;
}

export class UpdateFiscalSequenceDto {
  @IsString()
  sequenceType?: string;

  @IsString()
  prefix?: string;

  @IsInt()
  @Type(() => Number)
  currentNumber?: number;

  @IsInt()
  @Type(() => Number)
  endNumber?: number;

  @IsBoolean()
  isActive?: boolean;

  @IsDateString()
  expirationDate?: string;
}