import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditService } from './audit.service';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    userId?: string;
    sub?: string;
  };
};

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
  ) {}

  // Consultar el historial del usuario autenticado
  @Get('me')
  async getMyHistory(@Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.id ??
      req.user?.userId ??
      req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException(
        'Debes iniciar sesión para consultar tu historial',
      );
    }

    return this.auditService.findByUser(userId);
  }
}
