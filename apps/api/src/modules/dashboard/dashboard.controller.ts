import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  @Get()
  getDashboardData() {
    // Real app me yahan DB (Prisma) se count aayega, abhi ke liye honest 0 return karenge
    return {
      totalOrders: 0,
      verificationRate: 0,
      activeAlerts: 0,
      message: "Live API Data"
    };
  }
}
