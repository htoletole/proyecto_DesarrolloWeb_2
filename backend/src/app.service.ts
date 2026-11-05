import { Injectable } from '@nestjs/common';
import { AuditService } from './audit/audit.service';

@Injectable()
export class AppService {
  constructor(private readonly auditService: AuditService) {}

  async getHello(): Promise<string> {
    // Simulation of an action that triggers an audit log
    const userId = 'demo-user-id';
    
    await this ent.auditService.log(
      'ACCESS_APP',
      'APP',
      'ROOT',
      userId,
      { message: 'User accessed the application root' }
    );

    return '¡Hola desde el Backend! (Audit log created)';
  }
}
