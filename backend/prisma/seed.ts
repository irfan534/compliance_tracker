import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      description: 'Leading enterprise software company',
      industry: 'Technology',
      size: 'enterprise',
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tracker.local',
      password: '$2a$10$ZIYmYEsU3tKxvpZPJr7sKe5E5mzKNBz9y8v6z8v6z8v6z8v6z', // bcrypted 'Admin@123'
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  // Create compliance manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@tracker.local',
      password: '$2a$10$ZIYmYEsU3tKxvpZPJr7sKe5E5mzKNBz9y8v6z8v6z8v6z8v6z',
      firstName: 'Compliance',
      lastName: 'Manager',
      role: 'COMPLIANCE_MANAGER',
      department: 'Compliance',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  // Create frameworks
  const frameworks = await Promise.all([
    prisma.framework.create({
      data: { name: 'ISO 27001', type: 'ISO', description: 'Information Security Management' },
    }),
    prisma.framework.create({
      data: { name: 'SOC 2', type: 'SOC', description: 'Service Organization Control' },
    }),
    prisma.framework.create({
      data: { name: 'HIPAA', type: 'HIPAA', description: 'Health Insurance Portability and Accountability' },
    }),
    prisma.framework.create({
      data: { name: 'PCI DSS', type: 'PCI', description: 'Payment Card Industry Data Security Standard' },
    }),
    prisma.framework.create({
      data: { name: 'GDPR', type: 'GDPR', description: 'General Data Protection Regulation' },
    }),
  ]);

  // Create framework associations
  for (const framework of frameworks) {
    await prisma.frameworkAssociation.create({
      data: {
        organizationId: organization.id,
        frameworkId: framework.id,
        maturityLevel: Math.floor(Math.random() * 5) + 1,
        compliancePercentage: Math.floor(Math.random() * 100),
        owner: manager.id,
      },
    });
  }

  // Create sample certifications
  const certification = await prisma.certification.create({
    data: {
      name: 'ISO 27001 Certification',
      certificateId: 'ISO27001-2024-001',
      certificateType: 'ISO 27001',
      issueDate: new Date('2023-01-01'),
      expiryDate: new Date('2026-01-01'),
      validityDays: 1095,
      issuingBody: 'BSI',
      owner: manager.id,
      department: 'Security',
      status: 'ACTIVE',
      organizationId: organization.id,
      userId: manager.id,
    },
  });

  // Map certification to framework
  await prisma.frameworkCertification.create({
    data: {
      frameworkId: frameworks[0].id, // ISO 27001
      certificationId: certification.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
