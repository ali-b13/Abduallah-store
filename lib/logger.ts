// lib/utils/logger.ts
import prisma from "@/lib/database/prisma";

type LogAction = {
  actionType: 'CREATE' | 'UPDATE' | 'BLOCK'|"UNBLOCK" |"DELETE";
  entityType: 'PRODUCT' | 'BANNER' | 'USER';
  entityId: string;
  userId: string;
  details?: string;
};

export const createLog = async (logData: LogAction) => {
  try {
    await prisma.logs.create({
      data: {
        ...logData,
        details: logData.details || `${logData.actionType} العملية علئ ${logData.entityType}`
      }
    });
  } catch (error) {
    console.error('Error creating log:', error);
  }
};