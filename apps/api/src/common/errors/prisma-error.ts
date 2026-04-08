import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { ERROR_CODES } from '@repo/shared';

export function mapPrismaError(e: unknown): null | {
  status: number;
  code: string;
  message: string;
  details?: unknown;
} {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return null;

  // https://www.prisma.io/docs/orm/reference/error-reference
  switch (e.code) {
    case 'P2002':
      return {
        status: HttpStatus.CONFLICT,
        code: ERROR_CODES.DB_UNIQUE_CONSTRAINT,
        message: 'Dữ liệu bị trùng và vi phạm ràng buộc duy nhất',
        details: { target: (e.meta as any)?.target ?? null },
      };

    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.DB_NOT_FOUND,
        message: 'Không tìm thấy bản ghi',
      };

    default:
      return {
        status: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.DB_CONSTRAINT,
        message: 'Yêu cầu đến cơ sở dữ liệu không hợp lệ',
        details: { prismaCode: e.code },
      };
  }
}
