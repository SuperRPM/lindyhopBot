import { IsString, IsNotEmpty } from 'class-validator';

export class ReceiptAnalysisDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;
}

export class ReceiptItemDto {
  name: string;
  price: number;
  category: '안주' | '주류' | '음료';
}

export class ReceiptAnalysisResponseDto {
  success: boolean;
  data: {
    totalAmount: number;
    categories: {
      안주: {
        items: ReceiptItemDto[];
        total: number;
      };
      주류: {
        items: ReceiptItemDto[];
        total: number;
      };
      음료: {
        items: ReceiptItemDto[];
        total: number;
      };
    };
    rawText?: string;
  };
  message?: string;
} 