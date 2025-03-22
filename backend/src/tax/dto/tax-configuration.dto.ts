import { IsString, IsDecimal, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxConfigurationDto {
  @IsUUID()
  businessProfileId: string;

  @IsString()
  taxType: string;

  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  rate: number;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateTaxConfigurationDto {
  @IsString()
  taxType?: string;

  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  rate?: number;

  @IsBoolean()
  isActive?: boolean;
}