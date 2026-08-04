import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('scanner')
export class ScannerController {
  @Get(':barcode')
  scanItem(@Param('barcode') barcode: string) {
    // Returns dummy validated data to prevent 404 on frontend scanner screen
    return {
      success: true,
      data: {
        barcode: barcode,
        itemName: 'Verified Asset ' + barcode,
        status: 'VERIFIED',
        timestamp: new Date().toISOString()
      }
    };
  }
}
