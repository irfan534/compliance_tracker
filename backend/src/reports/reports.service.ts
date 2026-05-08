import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateExpiryReport(organizationId: string) {
    const certifications = await this.prisma.certification.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();
    const expiryData = certifications.map(cert => ({
      ...cert,
      daysRemaining: Math.floor((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return {
      type: 'EXPIRY_FORECAST',
      generatedAt: new Date(),
      certifications: expiryData,
      total: certifications.length,
    };
  }

  async generateComplianceReport(organizationId: string) {
    const frameworks = await this.prisma.frameworkAssociation.findMany({
      where: { organizationId },
      include: { framework: true },
    });

    return {
      type: 'COMPLIANCE_STATUS',
      generatedAt: new Date(),
      frameworks,
      avgCompliance: frameworks.length > 0
        ? Math.round(frameworks.reduce((sum, f) => sum + f.compliancePercentage, 0) / frameworks.length)
        : 0,
    };
  }
}
