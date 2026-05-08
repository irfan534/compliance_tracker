export class CreateCompanyDto {
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  certificateName?: string;
  region?: string;
  certificationIds?: string[];
}