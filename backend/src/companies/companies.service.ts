import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCompanyDto) {
    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
        industry: data.industry,
        description: data.description,
        website: data.website,
      },
    });

    // If certification IDs are provided, create certifications for this organization
    if (data.certificationIds && data.certificationIds.length > 0) {
      // Note: This is a simplified approach. In production, you might want to
      // associate existing certifications or create new ones based on templates
      console.log('Certification IDs provided:', data.certificationIds);
    }

    return organization;
  }

  async findAll() {
    const organizations = await this.prisma.organization.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            users: true,
            certifications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const companies = organizations.map(org => ({
      id: org.id,
      name: org.name,
      industry: org.industry || 'N/A',
      size: org.size || 'N/A',
      description: org.description,
      website: org.website,
      contactEmail: null,
      contactPhone: null,
      address: null,
      status: 'ACTIVE',
      createdAt: org.createdAt.toISOString(),
      userCount: org._count.users,
      certificationCount: org._count.certifications,
    }));

    return { companies };
  }

  async findById(id: string) {
    return this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: {
        certifications: true,
        _count: {
          select: {
            users: true,
            certifications: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}