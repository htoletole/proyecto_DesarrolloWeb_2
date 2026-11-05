import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from './schemas/activity-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLog>,
  ) {}

  // Registrar una nueva actividad
  async log(
    action: string,
    entity: string,
    entityId: string,
    userId: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const newLog = new this.activityLogModel({
      action,
      entity,
      entityId,
      userId,
      metadata,
      timestamp: new Date(),
    });

    await newLog.save();
  }

  // Consultar el historial de un usuario
  async findByUser(userId: string): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .exec();
  }

  // Consultar las actividades de una entidad
  async findByEntity(
    entity: string,
    entityId: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ entity, entityId })
      .sort({ timestamp: -1 })
      .limit(50)
      .exec();
  }
}
