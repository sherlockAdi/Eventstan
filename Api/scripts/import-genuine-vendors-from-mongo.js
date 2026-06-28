const { execFileSync } = require('node:child_process');
const { randomBytes, scryptSync } = require('node:crypto');
const path = require('node:path');
const { PrismaClient, UserRole, VendorStatus } = require('../node_modules/@prisma/client');

const prisma = new PrismaClient();
const MONGOSH_PATH = 'C:\\Program Files\\mongosh\\mongosh.exe';
const MONGO_URI = 'mongodb://localhost:27017';
const MONGO_DB = 'eventstanDb';
const DEFAULT_PASSWORD = 'Vendor123';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  const email = normalizeString(value).toLowerCase();
  return email;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(value) {
  const phone = normalizeString(value);
  return phone || '';
}

function toNullable(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function parseCityList(record) {
  const candidates = [
    normalizeString(record.whereYourBusiness),
    normalizeString(record.businessLocation),
    normalizeString(record.location),
  ].filter(Boolean);
  if (candidates.length) return [...new Set(candidates)];

  const address = normalizeString(record.address);
  if (!address) return ['Dubai'];
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return [parts[parts.length - 1] || 'Dubai'];
}

function splitName(fullName) {
  const cleaned = normalizeString(fullName);
  if (!cleaned) return { firstName: null, lastName: null };
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

function parseDate(value) {
  const raw = normalizeString(value);
  if (!raw) return null;
  const numeric = Number(raw);
  const date = Number.isFinite(numeric) && numeric > 0 ? new Date(numeric) : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function slugify(value) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function isTestVendor(record) {
  const combined = [
    record.email,
    record.firstName,
    record.lastName,
    record.userName,
    record.companyName,
    record.contactPerson,
    record.contactEmail,
  ]
    .map((value) => normalizeString(value).toLowerCase())
    .join(' ');

  const testPatterns = [
    /\btest\b/,
    /testing/,
    /hellotest/,
    /\bdemo\b/,
    /\bdummy\b/,
    /\bsample\b/,
    /\btrial\b/,
    /neuralinfo/,
    /neural info/,
    /@eventstan\.com\b/,
    /\beventstan\b/,
  ];

  if (testPatterns.some((pattern) => pattern.test(combined))) return true;

  const companyName = normalizeString(record.companyName).toLowerCase();
  const contactPerson = normalizeString(record.contactPerson).toLowerCase();
  const email = normalizeEmail(record.email);

  if (email === 'true' && !companyName && !contactPerson) return true;
  if (!email && !companyName && !contactPerson) return true;

  return false;
}

function loadMongoVendors() {
  const mongoScript = `
    const dbRef = db.getSiblingDB('${MONGO_DB}');
    const docs = dbRef.vendors.aggregate([
      { $lookup: { from: 'vendordetails', localField: '_id', foreignField: 'vendorId', as: 'detail' } },
      { $unwind: { path: '$detail', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          oldVendorId: { $toString: '$_id' },
          firstName: '$firstName',
          lastName: '$lastName',
          email: '$email',
          phoneNumber: '$phoneNumber',
          countryCode: '$countryCode',
          address: '$address',
          location: '$location',
          about: '$about',
          specilization: '$specilization',
          commisionPercentage: '$commisionPercentage',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          userName: '$userName',
          isVerified: '$isVerified',
          isBlocked: '$isBlocked',
          isDeleted: '$isDeleted',
          isPremium: '$isPremium',
          password: '$password',
          imageUrl: '$imageUrl',
          inviteCode: '$inviteCode',
          appleId: '$appleId',
          facebookId: '$facebookId',
          googleId: '$googleId',
          deviceToken: '$deviceToken',
          tradeExpiry: '$detail.tradeExpiry',
          estCardExpiry: '$detail.estCardExpiry',
          noOfPartners: '$detail.noOfPartners',
          companyName: '$detail.companyName',
          contactPerson: '$detail.contactPerson',
          contactEmail: '$detail.contactEmail',
          contactMobile: '$detail.contactMobile',
          mobile: '$detail.mobile',
          whereYourBusiness: '$detail.whereYourBusiness',
          visaType: '$detail.visaType',
          planDetails: '$detail.planDetails',
          planExpiry: '$detail.planExpiry',
          agreementFileUrl: '$detail.agreementFileUrl',
          bankName: '$detail.bankName',
          accountName: '$detail.accountName',
          ibanNo: '$detail.ibanNo',
          accountNumber: '$detail.accountNumber',
          swift: '$detail.swift',
          branchAddress: '$detail.branchAddress',
          aboutyou: '$detail.aboutyou'
        }
      }
    ]).toArray();
    print(JSON.stringify(docs));
  `;

  const output = execFileSync(MONGOSH_PATH, ['--quiet', MONGO_URI, '--eval', mongoScript], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 30,
    cwd: path.resolve(__dirname, '..'),
  });

  return JSON.parse(output.trim() || '[]');
}

function uniqueValue(baseValue, usedSet, fallbackFactory) {
  let candidate = baseValue;
  if (!candidate) candidate = fallbackFactory();

  if (!usedSet.has(candidate)) {
    usedSet.add(candidate);
    return candidate;
  }

  let counter = 2;
  while (usedSet.has(`${candidate}-${counter}`)) counter += 1;
  const unique = `${candidate}-${counter}`;
  usedSet.add(unique);
  return unique;
}

function uniqueEmail(baseEmail, usedSet, fallbackLocalPart) {
  const normalizedBase = normalizeEmail(baseEmail);
  const fallback = `${fallbackLocalPart}@eventstan.local`;
  const candidate = normalizedBase || fallback;

  const build = (email, counter = 1) => {
    const [localPart, domain = 'eventstan.local'] = email.split('@');
    return counter === 1 ? `${localPart}@${domain}` : `${localPart}+${counter}@${domain}`;
  };

  let counter = 1;
  let unique = build(candidate, counter);
  while (usedSet.has(unique)) {
    counter += 1;
    unique = build(candidate, counter);
  }
  usedSet.add(unique);
  return unique;
}

async function main() {
  const mongoVendors = loadMongoVendors();

  const existingUsers = await prisma.user.findMany({
    where: { role: UserRole.VENDOR },
    select: { email: true, phone: true },
  });
  const existingVendors = await prisma.vendor.findMany({
    select: {
      oldVendorId: true,
      email: true,
      primaryEmail: true,
      userName: true,
      phone: true,
    },
  });

  const usedUserEmails = new Set(existingUsers.map((user) => normalizeEmail(user.email)).filter(Boolean));
  const usedVendorEmails = new Set(existingVendors.map((vendor) => normalizeEmail(vendor.email)).filter(Boolean));
  const usedPrimaryEmails = new Set(existingVendors.map((vendor) => normalizeEmail(vendor.primaryEmail || '')).filter(Boolean));
  const usedUserPhones = new Set(existingUsers.map((user) => normalizePhone(user.phone || '')).filter(Boolean));
  const usedVendorUserNames = new Set(existingVendors.map((vendor) => normalizeString(vendor.userName || '').toLowerCase()).filter(Boolean));
  const existingOldVendorIds = new Set(existingVendors.map((vendor) => normalizeString(vendor.oldVendorId || '')).filter(Boolean));

  let imported = 0;
  let skippedTest = 0;
  let skippedExisting = 0;
  let skippedEmpty = 0;
  let syntheticEmailCount = 0;

  for (const record of mongoVendors) {
    const oldVendorId = normalizeString(record.oldVendorId);
    if (!oldVendorId) {
      skippedEmpty += 1;
      continue;
    }

    if (existingOldVendorIds.has(oldVendorId)) {
      skippedExisting += 1;
      continue;
    }

    if (isTestVendor(record)) {
      skippedTest += 1;
      continue;
    }

    const actualEmailCandidates = [
      normalizeEmail(record.contactEmail),
      normalizeEmail(record.email),
    ].filter(Boolean);
    const actualEmail = actualEmailCandidates.find((value) => isValidEmail(value)) || '';

    const loginEmail = uniqueEmail(actualEmail, usedUserEmails, `vendor-${oldVendorId}`);
    const vendorEmail = uniqueEmail(actualEmail || loginEmail, usedVendorEmails, `vendor-profile-${oldVendorId}`);
    if (!actualEmail || loginEmail.endsWith('@eventstan.local') || vendorEmail.endsWith('@eventstan.local')) {
      syntheticEmailCount += 1;
    }

    const fullName = normalizeString(record.contactPerson) || normalizeString(record.firstName) || normalizeString(record.companyName);
    const { firstName, lastName } = splitName(fullName);
    const companyName = normalizeString(record.companyName) || normalizeString(record.contactPerson) || `Vendor ${oldVendorId.slice(-6)}`;
    const contactPerson = normalizeString(record.contactPerson) || normalizeString(record.firstName) || companyName;
    const vendorPhone = normalizePhone(record.contactMobile) || normalizePhone(record.mobile) || normalizePhone(record.phoneNumber) || `+1000${oldVendorId.slice(-8)}`;
    const userPhoneCandidate = normalizePhone(record.phoneNumber) || normalizePhone(record.contactMobile) || normalizePhone(record.mobile);
    const userPhone = userPhoneCandidate && !usedUserPhones.has(userPhoneCandidate) ? userPhoneCandidate : null;
    if (userPhone) usedUserPhones.add(userPhone);

    const userNameSeed = slugify(record.userName || contactPerson || companyName);
    const userName = userNameSeed
      ? uniqueValue(userNameSeed.toLowerCase(), usedVendorUserNames, () => `vendor-${oldVendorId.slice(-6)}`)
      : null;

    const vendorStatus = record.isBlocked || record.isDeleted
      ? VendorStatus.SUSPENDED
      : record.isVerified
        ? VendorStatus.APPROVED
        : VendorStatus.PENDING_VERIFICATION;

    const cities = parseCityList(record);
    const legacyEmail = actualEmail && actualEmail !== vendorEmail ? actualEmail : null;
    const agreementFileUrl = toNullable(record.agreementFileUrl);
    const agreementFileKey = agreementFileUrl
      ? agreementFileUrl.split('/vendor_document/')[1] || agreementFileUrl.split('/').pop() || null
      : null;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: contactPerson,
          email: loginEmail,
          phone: userPhone,
          role: UserRole.VENDOR,
          isActive: !(record.isBlocked || record.isDeleted),
          passwordHash: hashPassword(DEFAULT_PASSWORD),
        },
      });

      await tx.vendor.create({
        data: {
          userId: user.id,
          oldVendorId,
          companyName,
          contactPerson,
          email: vendorEmail,
          phone: vendorPhone,
          about: toNullable(record.aboutyou) || toNullable(record.about),
          firstName,
          lastName,
          userName,
          primaryEmail: legacyEmail || (actualEmail && actualEmail !== vendorEmail ? actualEmail : actualEmail || null),
          telephone: normalizePhone(record.contactMobile) || normalizePhone(record.mobile) || null,
          primaryMobile: normalizePhone(record.mobile) || normalizePhone(record.phoneNumber) || null,
          specialization: toNullable(record.specilization),
          businessLocation: toNullable(record.whereYourBusiness) || cities[0] || 'Dubai',
          visaType: toNullable(record.visaType),
          address: toNullable(record.address),
          tradeLicenseNumber: `OLD-${oldVendorId}`,
          updatedProfile: true,
          status: vendorStatus,
          cities,
          capacityPerDay: 1,
          commissionPercent: Number(record.commisionPercentage || 0),
          planDetails: toNullable(record.planDetails),
          planExpiry: parseDate(record.planExpiry),
          agreementFileUrl,
          agreementFileKey,
          bankName: toNullable(record.bankName),
          accountFullName: toNullable(record.accountName),
          ibanNo: toNullable(record.ibanNo),
          accountNumber: toNullable(record.accountNumber),
          swift: toNullable(record.swift),
          branchAddress: toNullable(record.branchAddress),
          appleId: toNullable(record.appleId),
          countryCode: toNullable(record.countryCode),
          deviceToken: toNullable(record.deviceToken),
          estCardExpiry: toNullable(record.estCardExpiry),
          facebookId: toNullable(record.facebookId),
          googleId: toNullable(record.googleId),
          imageUrl: record.imageUrl || null,
          inviteCode: toNullable(record.inviteCode),
          isBlocked: Boolean(record.isBlocked),
          isDeleted: Boolean(record.isDeleted),
          isPremium: typeof record.isPremium === 'number' ? record.isPremium : 0,
          isVerified: Boolean(record.isVerified),
          noOfPartners: Number.isFinite(Number(record.noOfPartners)) ? Number(record.noOfPartners) : null,
          password: DEFAULT_PASSWORD,
          tradeExpiry: toNullable(record.tradeExpiry),
        },
      });
    });

    existingOldVendorIds.add(oldVendorId);
    imported += 1;
  }

  const finalVendorCount = await prisma.vendor.count();
  const finalUserCount = await prisma.user.count({ where: { role: UserRole.VENDOR } });

  console.log(JSON.stringify({
    mongoTotal: mongoVendors.length,
    imported,
    skippedTest,
    skippedExisting,
    skippedEmpty,
    syntheticEmailCount,
    finalVendorCount,
    finalUserCount,
    defaultPassword: DEFAULT_PASSWORD,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
