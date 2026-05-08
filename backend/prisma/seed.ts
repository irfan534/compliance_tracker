import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

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

  // Hash passwords using Argon2
  const adminPassword = await argon2.hash('Demo@123456', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });

  const managerPassword = await argon2.hash('Manager@123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });

  const officerPassword = await argon2.hash('Officer@123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });

  const auditorPassword = await argon2.hash('Auditor@123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });

  const riskManagerPassword = await argon2.hash('RiskManager@123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
    hashLength: 32,
  });

  // Create users with proper roles
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tracker.local',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@tracker.local',
      password: managerPassword,
      firstName: 'Compliance',
      lastName: 'Manager',
      role: 'COMPLIANCE_MANAGER',
      department: 'Compliance',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  const officer = await prisma.user.create({
    data: {
      email: 'officer@example.com',
      password: officerPassword,
      firstName: 'Compliance',
      lastName: 'Officer',
      role: 'COMPLIANCE_MANAGER',
      department: 'Compliance',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  const auditor = await prisma.user.create({
    data: {
      email: 'auditor@example.com',
      password: auditorPassword,
      firstName: 'External',
      lastName: 'Auditor',
      role: 'AUDITOR',
      department: 'Audit',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  const riskManager = await prisma.user.create({
    data: {
      email: 'riskmanager@example.com',
      password: riskManagerPassword,
      firstName: 'Risk',
      lastName: 'Manager',
      role: 'COMPLIANCE_MANAGER',
      department: 'Risk Management',
      emailVerified: true,
      organizationId: organization.id,
    },
  });

  // Create frameworks with real names
  const iso27001 = await prisma.framework.create({
    data: { name: 'ISO 27001', type: 'ISO', description: 'Information Security Management System' },
  });

  const soc2 = await prisma.framework.create({
    data: { name: 'SOC 2', type: 'SOC', description: 'Service Organization Control 2' },
  });

  const gdpr = await prisma.framework.create({
    data: { name: 'GDPR', type: 'GDPR', description: 'General Data Protection Regulation' },
  });

  const hipaa = await prisma.framework.create({
    data: { name: 'HIPAA', type: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
  });

  const pciDss = await prisma.framework.create({
    data: { name: 'PCI DSS', type: 'PCI', description: 'Payment Card Industry Data Security Standard' },
  });

  const frameworks = [iso27001, soc2, gdpr, hipaa, pciDss];

  // Create framework associations with realistic compliance percentages (60-95%)
  const frameworkAssociations = [];
  const complianceData = [
    { framework: iso27001, compliance: 87, maturity: 3, owner: manager.id },
    { framework: soc2, compliance: 82, maturity: 4, owner: officer.id },
    { framework: gdpr, compliance: 78, maturity: 3, owner: riskManager.id },
    { framework: hipaa, compliance: 91, maturity: 4, owner: manager.id },
    { framework: pciDss, compliance: 85, maturity: 3, owner: auditor.id },
  ];

  for (const data of complianceData) {
    const association = await prisma.frameworkAssociation.create({
      data: {
        organizationId: organization.id,
        frameworkId: data.framework.id,
        maturityLevel: data.maturity,
        compliancePercentage: data.compliance,
        owner: data.owner,
      },
    });
    frameworkAssociations.push(association);
  }

  // Create certifications for each framework with realistic data
  const today = new Date();
  const certifications = [];

  // ISO 27001 Certification
  const isoCert = await prisma.certification.create({
    data: {
      name: 'ISO 27001:2013 Information Security Management',
      certificateId: 'ISO27001-2024-001',
      certificateType: 'ISO 27001',
      issueDate: new Date(today.getTime() - 730 * 24 * 60 * 60 * 1000), // 2 years ago
      expiryDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      validityDays: 1095,
      issuingBody: 'British Standards Institute (BSI)',
      owner: manager.id,
      department: 'Information Security',
      status: 'ACTIVE',
      organizationId: organization.id,
      userId: manager.id,
    },
  });
  certifications.push(isoCert);

  // SOC 2 Type II Certification
  const socCert = await prisma.certification.create({
    data: {
      name: 'SOC 2 Type II - Security',
      certificateId: 'SOC2-2024-001',
      certificateType: 'SOC 2',
      issueDate: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      expiryDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      validityDays: 730,
      issuingBody: 'Deloitte & Touche LLP',
      owner: officer.id,
      department: 'Compliance',
      status: 'ACTIVE',
      organizationId: organization.id,
      userId: officer.id,
    },
  });
  certifications.push(socCert);

  // GDPR Compliance Certification
  const gdprCert = await prisma.certification.create({
    data: {
      name: 'GDPR Compliance Certification',
      certificateId: 'GDPR-2024-001',
      certificateType: 'GDPR',
      issueDate: new Date(today.getTime() - 545 * 24 * 60 * 60 * 1000), // 1.5 years ago
      expiryDate: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      validityDays: 730,
      issuingBody: 'European Data Protection Board',
      owner: riskManager.id,
      department: 'Data Privacy',
      status: 'ACTIVE',
      organizationId: organization.id,
      userId: riskManager.id,
    },
  });
  certifications.push(gdprCert);

  // HIPAA Compliance Certification
  const hipaaCert = await prisma.certification.create({
    data: {
      name: 'HIPAA Security Rule Compliance',
      certificateId: 'HIPAA-2024-001',
      certificateType: 'HIPAA',
      issueDate: new Date(today.getTime() - 182 * 24 * 60 * 60 * 1000), // 6 months ago
      expiryDate: new Date(today.getTime() + 545 * 24 * 60 * 60 * 1000), // 1.5 years from now
      validityDays: 730,
      issuingBody: 'Health and Human Services (HHS)',
      owner: manager.id,
      department: 'Healthcare Compliance',
      status: 'ACTIVE',
      organizationId: organization.id,
      userId: manager.id,
    },
  });
  certifications.push(hipaaCert);

  // PCI DSS Certification
  const pciCert = await prisma.certification.create({
    data: {
      name: 'PCI DSS Level 1 Compliance',
      certificateId: 'PCIDSS-2024-001',
      certificateType: 'PCI DSS',
      issueDate: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      expiryDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
      validityDays: 455,
      issuingBody: 'Qualified Security Assessor (QSA)',
      owner: auditor.id,
      department: 'Payment Security',
      status: 'ACTIVE',
      organizationId: organization.id,
      userId: auditor.id,
    },
  });
  certifications.push(pciCert);

  // Map certifications to frameworks
  await prisma.frameworkCertification.create({
    data: {
      frameworkId: iso27001.id,
      certificationId: isoCert.id,
    },
  });

  await prisma.frameworkCertification.create({
    data: {
      frameworkId: soc2.id,
      certificationId: socCert.id,
    },
  });

  await prisma.frameworkCertification.create({
    data: {
      frameworkId: gdpr.id,
      certificationId: gdprCert.id,
    },
  });

  await prisma.frameworkCertification.create({
    data: {
      frameworkId: hipaa.id,
      certificationId: hipaaCert.id,
    },
  });

  await prisma.frameworkCertification.create({
    data: {
      frameworkId: pciDss.id,
      certificationId: pciCert.id,
    },
  });

  // Create audit logs with realistic data
  await prisma.auditLog.create({
    data: {
      action: 'CERT_CREATED',
      entityType: 'CERTIFICATION',
      entityId: isoCert.id,
      details: 'ISO 27001 certification created',
      userId: manager.id,
      organizationId: organization.id,
      severity: 'INFO',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CERT_CREATED',
      entityType: 'CERTIFICATION',
      entityId: socCert.id,
      details: 'SOC 2 Type II certification created',
      userId: officer.id,
      organizationId: organization.id,
      severity: 'INFO',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CERT_CREATED',
      entityType: 'CERTIFICATION',
      entityId: gdprCert.id,
      details: 'GDPR compliance certification created',
      userId: riskManager.id,
      organizationId: organization.id,
      severity: 'INFO',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CERT_CREATED',
      entityType: 'CERTIFICATION',
      entityId: hipaaCert.id,
      details: 'HIPAA compliance certification created',
      userId: manager.id,
      organizationId: organization.id,
      severity: 'INFO',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CERT_CREATED',
      entityType: 'CERTIFICATION',
      entityId: pciCert.id,
      details: 'PCI DSS compliance certification created',
      userId: auditor.id,
      organizationId: organization.id,
      severity: 'INFO',
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