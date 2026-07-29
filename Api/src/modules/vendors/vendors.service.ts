import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, VendorStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { PasswordService } from '../auth/password.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateVendorDto) {
    const loginEmail = (dto.primaryEmail || dto.email).trim().toLowerCase();
    if (!dto.password) throw new ConflictException('A temporary password is required');
    if (await this.prisma.user.findUnique({ where: { email: loginEmail } })) {
      throw new ConflictException('A login account already exists for this email');
    }

    const vendor = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.contactPerson,
          email: loginEmail,
          phone: dto.phone,
          role: UserRole.VENDOR,
          passwordHash: await this.passwords.hash(dto.password!),
        },
      });
      const vendorData: Prisma.VendorUncheckedCreateInput = {
        userId: user.id,
        companyName: dto.companyName,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        countryCode: dto.countryCode,
        inviteCode: dto.inviteCode,
        tradeLicenseNumber: dto.tradeLicenseNumber?.trim() || null,
        tradeLicenseExpiry: dto.tradeLicenseExpiry ? new Date(dto.tradeLicenseExpiry) : undefined,
        tradeLicenseFileUrl: dto.tradeLicenseFileUrl,
        tradeLicenseFileKey: dto.tradeLicenseFileKey,
        passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : undefined,
        passportFileUrl: dto.passportFileUrl,
        passportFileKey: dto.passportFileKey,
        emiratesIdExpiry: dto.emiratesIdExpiry ? new Date(dto.emiratesIdExpiry) : undefined,
        cities: dto.cities,
        capacityPerDay: dto.capacityPerDay,
        commissionPercent: dto.commissionPercent,
        about: dto.about,
        firstName: dto.firstName,
        lastName: dto.lastName,
        userName: dto.userName,
        primaryEmail: dto.primaryEmail,
        telephone: dto.telephone,
        primaryMobile: dto.primaryMobile,
        specialization: dto.specialization,
        vendorType: dto.vendorType,
        businessLocation: dto.businessLocation,
        visaType: dto.visaType,
        address: dto.address,
        vendorProfileImage: dto.vendorProfileImage,
        vatNumber: dto.vatNumber,
        planDetails: dto.planDetails,
        planExpiry: dto.planExpiry ? new Date(dto.planExpiry) : undefined,
        agreementFileUrl: dto.agreementFileUrl,
        agreementFileKey: dto.agreementFileKey,
        bankName: dto.bankName,
        accountFullName: dto.accountFullName,
        ibanNo: dto.ibanNo,
        accountNumber: dto.accountNumber,
        swift: dto.swift,
        branchAddress: dto.branchAddress,
        status: VendorStatus.PENDING_VERIFICATION,
      };
      return tx.vendor.create({
        data: vendorData,
      });
    });

    let welcomeEmailSent = true;
    try {
      await this.mail.sendTemplate(
        'VENDOR_WELCOME',
        loginEmail,
        {
          name: dto.contactPerson,
          company_name: dto.companyName,
          email: loginEmail,
          password: dto.password,
          login_url: 'https://vendor.eventstan.com',
          panel_url: 'https://vendor.eventstan.com',
        },
        {
          subject: 'Welcome to EventStan, {{name}}',
          body: `
            <h2>Welcome to EventStan, {{name}}!</h2>
            <p>Your vendor account for <strong>{{company_name}}</strong> has been created.</p>
            <p><strong>Vendor Panel:</strong> <a href="{{panel_url}}">{{panel_url}}</a><br>
            <strong>Login URL:</strong> <a href="{{login_url}}">{{login_url}}</a><br>
            <strong>Email:</strong> {{email}}<br>
            <strong>Temporary password:</strong> {{password}}</p>
            <p>Please sign in, complete your profile, and then you can access the rest of the vendor panel.</p>
          `,
        },
      );
    } catch {
      welcomeEmailSent = false;
    }

    return { ...vendor, welcomeEmailSent };
  }

  findAll(status?: VendorStatus) {
    return this.prisma.vendor.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  update(id: string, dto: Partial<CreateVendorDto>) {
    return this.prisma.vendor.update({
      where: { id },
      data: this.vendorData(dto),
    });
  }

  updateProfile(id: string, dto: Partial<CreateVendorDto>) {
    return this.prisma.vendor.update({
      where: { id },
      data: {
        ...this.vendorData(dto),
        updatedProfile: true,
      },
    });
  }

  updateStatus(id: string, status: VendorStatus, reason?: string) {
    return this.prisma.vendor.update({ where: { id }, data: { status } }).then((vendor) => ({ ...vendor, statusReason: reason }));
  }

  delete(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }

  async findForUser(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async assertCanManage(user: AuthenticatedUser, vendorId: string) {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return;
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor || vendor.userId !== user.id) throw new NotFoundException('Vendor not found');
  }

  private vendorData(dto: Partial<CreateVendorDto>): Prisma.VendorUncheckedUpdateInput {
    const data: Record<string, string | string[] | number | Date | null> = {};

    const stringFields = [
      'companyName',
      'contactPerson',
      'email',
      'phone',
      'countryCode',
      'about',
      'firstName',
      'lastName',
      'userName',
      'primaryEmail',
      'telephone',
      'primaryMobile',
      'specialization',
      'vendorType',
      'inviteCode',
      'businessLocation',
      'visaType',
      'address',
      'vendorProfileImage',
      'tradeLicenseNumber',
      'tradeLicenseFileUrl',
      'tradeLicenseFileKey',
      'passportFileUrl',
      'passportFileKey',
      'vatNumber',
      'planDetails',
      'agreementFileUrl',
      'agreementFileKey',
      'bankName',
      'accountFullName',
      'ibanNo',
      'accountNumber',
      'swift',
      'branchAddress',
    ] as const;

    for (const field of stringFields) {
      if (dto[field] !== undefined) data[field] = dto[field] || null;
    }

    if (dto.cities !== undefined) data.cities = dto.cities;
    if (dto.capacityPerDay !== undefined) data.capacityPerDay = dto.capacityPerDay;
    if (dto.commissionPercent !== undefined) data.commissionPercent = dto.commissionPercent;
    if (dto.planExpiry !== undefined) data.planExpiry = dto.planExpiry ? new Date(dto.planExpiry) : null;
    if (dto.tradeLicenseExpiry !== undefined) data.tradeLicenseExpiry = dto.tradeLicenseExpiry ? new Date(dto.tradeLicenseExpiry) : null;
    if (dto.passportExpiry !== undefined) data.passportExpiry = dto.passportExpiry ? new Date(dto.passportExpiry) : null;
    if (dto.emiratesIdExpiry !== undefined) data.emiratesIdExpiry = dto.emiratesIdExpiry ? new Date(dto.emiratesIdExpiry) : null;

    return data as Prisma.VendorUncheckedUpdateInput;
  }
}
