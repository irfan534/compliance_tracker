import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: CreateCertificationDto) {
    return this.prisma.certification.create({
      data: {
        ...data,
        organizationId,
        userId,
        status: 'ACTIVE',
      },
    });
  }

  async findAll(organizationId: string, skip = 0, take = 20) {
    const certifications = await this.prisma.certification.findMany({
      where: { organizationId, deletedAt: null },
      skip,
      take,
      orderBy: { expiryDate: 'asc' },
    });

    const total = await this.prisma.certification.count({
      where: { organizationId, deletedAt: null },
    });

    return { certifications, total };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.certification.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        frameworks: { include: { framework: true } },
      },
    });
  }

  async update(id: string, organizationId: string, data: any) {
    return this.prisma.certification.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.certification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getExpiryMetrics(organizationId: string) {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, active, expiringSoon, expired, totalCompanies] = await Promise.all([
      this.prisma.certification.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.certification.count({
        where: { organizationId, status: 'ACTIVE', deletedAt: null },
      }),
      this.prisma.certification.count({
        where: {
          organizationId,
          expiryDate: { gte: now, lte: thirtyDaysLater },
          deletedAt: null,
        },
      }),
      this.prisma.certification.count({
        where: {
          organizationId,
          expiryDate: { lt: now },
          deletedAt: null,
        },
      }),
      this.prisma.organization.count({
        where: { deletedAt: null },
      }),
    ]);

    return { 
      total, 
      active, 
      expiringSoon, 
      expired,
      totalCompanies 
    };
  }
}
