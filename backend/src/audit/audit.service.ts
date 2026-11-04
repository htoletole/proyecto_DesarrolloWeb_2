import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from './schemas/activity-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLog>,
  ) {}

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
}
