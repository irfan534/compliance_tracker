import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FrameworksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.framework.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getOrganizationFrameworks(organizationId: string) {
    return this.prisma.frameworkAssociation.findMany({
      where: { organizationId },
      include: { framework: true },
      orderBy: { framework: { name: 'asc' } },
    });
  }

  async getComplianceMetrics(organizationId: string) {
    const frameworks = await this.prisma.frameworkAssociation.findMany({
      where: { organizationId },
    });

    const totalFrameworks = frameworks.length;
    const avgCompliance = frameworks.length > 0
      ? frameworks.reduce((sum, f) => sum + f.compliancePercentage, 0) / frameworks.length
      : 0;

    return {
      totalFrameworks,
      avgCompliance: Math.round(avgCompliance),
      frameworks,
    };
  }
}
