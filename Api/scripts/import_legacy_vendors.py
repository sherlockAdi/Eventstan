from __future__ import annotations

import argparse
import json
import re
import secrets
import tempfile
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from pathlib import Path

import paramiko
from pymongo import MongoClient


BAD_KEYWORDS = re.compile(r"(test|demo|dummy|sample|trial|asdf|abc123|lorem|hello ?test|hellotest|true|neural|admin)", re.I)
VALID_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@dataclass
class LegacyRecord:
    vendor: dict
    detail: dict


def normalize_email(value: str) -> str:
    return value.strip().lower()


def normalize_key(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).lower()


def first_nonempty(*values):
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return ""


def parse_dt(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip()
    if not text:
        return None
    text = text.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%d-%m-%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(text, fmt)
            except ValueError:
                continue
    return None


def is_genuine(vendor_doc, detail_doc):
    text = " ".join(str(vendor_doc.get(k, "") or "") for k in ["email", "firstName", "lastName", "userName"])
    text += " " + " ".join(str(detail_doc.get(k, "") or "") for k in ["contactPerson", "companyName", "contactEmail"])
    email = str(vendor_doc.get("email", "") or "").strip()
    if not email or not VALID_EMAIL.match(email):
        return False
    if BAD_KEYWORDS.search(text.lower()):
        return False
    if vendor_doc.get("isBlocked") or vendor_doc.get("isDeleted"):
        return False
    if not any(str(x or "").strip() for x in [vendor_doc.get("firstName"), vendor_doc.get("lastName"), vendor_doc.get("userName"), detail_doc.get("contactPerson")]):
        return False
    return True


def hash_vendor_password(password: str) -> str:
    import hashlib

    salt = secrets.token_hex(16)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, dklen=64)
    return f"scrypt:{salt}:{derived.hex()}"


def build_payload():
    mongo = MongoClient("mongodb://localhost:27017")
    db = mongo["eventstanDb"]
    details_map = {str(d["vendorId"]): d for d in db.vendordetails.find({})}

    records = []
    for vendor in db.vendors.find({}):
        detail = details_map.get(str(vendor["_id"]), {})
        if is_genuine(vendor, detail):
            records.append(LegacyRecord(vendor=vendor, detail=detail))

    return records


def unique_email(raw_email: str, old_id: str, used_emails: set[str]):
    raw = normalize_email(raw_email)
    if raw and VALID_EMAIL.match(raw) and raw not in used_emails:
        used_emails.add(raw)
        return raw, None
    synthetic = f"legacy-{old_id}@import.eventstan.local"
    suffix = 0
    while synthetic in used_emails:
        suffix += 1
        synthetic = f"legacy-{old_id}-{suffix}@import.eventstan.local"
    used_emails.add(synthetic)
    return synthetic, raw_email.strip() if raw_email else None


def unique_username(raw_username: str, old_id: str, used_usernames: set[str]):
    raw = raw_username.strip()
    if raw and normalize_key(raw) not in used_usernames:
        used_usernames.add(normalize_key(raw))
        return raw
    synthetic = f"legacy_{old_id[:8]}"
    suffix = 0
    while normalize_key(synthetic) in used_usernames:
        suffix += 1
        synthetic = f"legacy_{old_id[:8]}_{suffix}"
    used_usernames.add(normalize_key(synthetic))
    return synthetic


def pick_phone(values, used_phones: set[str]):
    for value in values:
        text = str(value or "").strip()
        if text and text not in used_phones:
            used_phones.add(text)
            return text
    return None


def fetch_remote_values(ssh: paramiko.SSHClient, db_name: str, query: str) -> set[str]:
    stdin, stdout, stderr = ssh.exec_command(f"psql -U postgres -d {db_name} -Atqc '{query}'")
    out = stdout.read().decode().splitlines()
    err = stderr.read().decode().strip()
    if err:
        raise RuntimeError(err)
    return {line.strip() for line in out if line.strip()}


def build_export(records, ssh: paramiko.SSHClient, db_name: str):
    used_emails = {normalize_email(x) for x in fetch_remote_values(ssh, db_name, "SELECT email FROM users")}
    used_emails |= {normalize_email(x) for x in fetch_remote_values(ssh, db_name, "SELECT email FROM vendors")}
    used_usernames = {normalize_key(x) for x in fetch_remote_values(ssh, db_name, 'SELECT "userName" FROM vendors WHERE "userName" IS NOT NULL')}
    used_phones = {x.strip() for x in fetch_remote_values(ssh, db_name, "SELECT phone FROM users WHERE phone IS NOT NULL") if x.strip()}

    payload = []
    email_counts = Counter(normalize_email(str(r.vendor.get("email", "") or "")) for r in records)
    username_counts = Counter(normalize_key(str(r.vendor.get("userName", "") or "")) for r in records if str(r.vendor.get("userName", "") or "").strip())

    for record in records:
        vendor = record.vendor
        detail = record.detail
        old_id = str(vendor["_id"])
        raw_email = str(vendor.get("email", "") or "").strip()
        login_email, preserved_email = unique_email(raw_email, old_id, used_emails)

        raw_username = str(vendor.get("userName", "") or "").strip()
        login_username = unique_username(raw_username, old_id, used_usernames)

        vendor_phone = first_nonempty(vendor.get("phoneNumber"), detail.get("contactMobile"), detail.get("mobile"))
        user_phone = pick_phone([vendor_phone], used_phones)

        full_name = first_nonempty(vendor.get("firstName"), vendor.get("lastName"), detail.get("contactPerson"), login_username)
        contact_person = first_nonempty(detail.get("contactPerson"), vendor.get("firstName"), vendor.get("lastName"), login_username, f"Legacy Vendor {old_id[:6]}")
        company_name = first_nonempty(detail.get("companyName"), contact_person, login_username, f"Legacy Vendor {old_id[:6]}")
        primary_email = first_nonempty(detail.get("contactEmail"), preserved_email if preserved_email else "", raw_email if login_email != normalize_email(raw_email) else "")
        about = first_nonempty(vendor.get("about"), detail.get("aboutyou"))

        commission_raw = vendor.get("commisionPercentage", 0)
        try:
            commission_value = Decimal(str(commission_raw or 0))
        except Exception:
            commission_value = Decimal("0")

        status = "APPROVED" if bool(vendor.get("isVerified")) else "PENDING_VERIFICATION"
        if bool(vendor.get("isBlocked")):
            status = "SUSPENDED"
        if bool(vendor.get("isDeleted")):
            status = "REJECTED"

        created_at = parse_dt(vendor.get("createdAt")) or datetime.utcnow()
        updated_at = parse_dt(vendor.get("updatedAt")) or created_at
        plan_expiry = parse_dt(detail.get("planExpiry"))

        image_url = vendor.get("imageUrl")
        if hasattr(image_url, "items"):
            try:
                image_url = dict(image_url)
            except Exception:
                image_url = None

        payload.append(
            {
                "old_vendor_id": old_id,
                "user": {
                    "id": f"user-{old_id}",
                    "name": full_name,
                    "email": login_email,
                    "phone": user_phone,
                    "passwordHash": hash_vendor_password("Vendor123"),
                    "role": "VENDOR",
                    "isActive": True,
                    "createdAt": created_at.isoformat(),
                    "updatedAt": updated_at.isoformat(),
                },
                "vendor": {
                    "id": f"vendor-{old_id}",
                    "userId": None,
                    "oldVendorId": old_id,
                    "companyName": company_name,
                    "contactPerson": contact_person,
                    "email": login_email,
                    "phone": vendor_phone or f"LEGACY-{old_id}",
                    "about": about or None,
                    "firstName": first_nonempty(vendor.get("firstName")) or None,
                    "lastName": first_nonempty(vendor.get("lastName")) or None,
                    "userName": login_username,
                    "primaryEmail": primary_email or None,
                    "telephone": first_nonempty(detail.get("contactMobile"), detail.get("mobile"), vendor.get("phoneNumber")) or None,
                    "primaryMobile": first_nonempty(detail.get("contactMobile"), detail.get("mobile"), vendor.get("phoneNumber")) or None,
                    "specialization": first_nonempty(vendor.get("specilization")) or None,
                    "businessLocation": first_nonempty(vendor.get("location"), detail.get("whereYourBusiness")) or None,
                    "visaType": first_nonempty(detail.get("visaType")) or None,
                    "address": first_nonempty(vendor.get("address")) or None,
                    "tradeLicenseNumber": f"LEGACY-{old_id}",
                    "vatNumber": None,
                    "updatedProfile": False,
                    "status": status,
                    "cities": [],
                    "capacityPerDay": 1,
                    "commissionPercent": str(commission_value),
                    "planDetails": first_nonempty(detail.get("planDetails")) or None,
                    "planExpiry": plan_expiry.isoformat() if plan_expiry else None,
                    "agreementFileUrl": first_nonempty(detail.get("agreementFileUrl")) or None,
                    "agreementFileKey": None,
                    "bankName": first_nonempty(detail.get("bankName")) or None,
                    "accountFullName": first_nonempty(detail.get("accountName")) or None,
                    "ibanNo": first_nonempty(detail.get("ibanNo")) or None,
                    "accountNumber": first_nonempty(detail.get("accountNumber")) or None,
                    "swift": first_nonempty(detail.get("swift")) or None,
                    "branchAddress": first_nonempty(detail.get("branchAddress")) or None,
                    "appleId": first_nonempty(vendor.get("appleId")) or None,
                    "countryCode": first_nonempty(vendor.get("countryCode")) or None,
                    "deviceToken": first_nonempty(vendor.get("deviceToken")) or None,
                    "estCardExpiry": first_nonempty(detail.get("estCardExpiry")) or None,
                    "facebookId": first_nonempty(vendor.get("facebookId")) or None,
                    "googleId": first_nonempty(vendor.get("googleId")) or None,
                    "imageUrl": image_url,
                    "inviteCode": first_nonempty(vendor.get("inviteCode")) or None,
                    "isBlocked": vendor.get("isBlocked"),
                    "isDeleted": vendor.get("isDeleted"),
                    "isPremium": vendor.get("isPremium"),
                    "isVerified": vendor.get("isVerified"),
                    "noOfPartners": detail.get("noOfPartners"),
                    "password": "Vendor123",
                    "tradeExpiry": first_nonempty(detail.get("tradeExpiry")) or None,
                    "createdAt": created_at.isoformat(),
                    "updatedAt": updated_at.isoformat(),
                },
            }
        )

    return payload


def main():
    parser = argparse.ArgumentParser(description="Import genuine legacy vendors into the new Postgres database.")
    parser.add_argument("--ssh-host", required=True)
    parser.add_argument("--ssh-user", required=True)
    parser.add_argument("--ssh-password", required=True)
    parser.add_argument("--db-name", default="eventstan_db")
    parser.add_argument("--remote-json", default="/tmp/legacy_vendors_genuine.json")
    parser.add_argument("--remote-script", default="/tmp/import_legacy_vendors_remote.py")
    args = parser.parse_args()

    records = build_payload()
    print(f"Genuine accounts prepared: {len(records)}")
    print(f"Email duplicates in genuine subset: {sum(1 for c in Counter(normalize_email(str(r.vendor.get('email', '') or '')) for r in records).values() if c > 1)}")
    print(f"Username duplicates in genuine subset: {sum(1 for c in Counter(normalize_key(str(r.vendor.get('userName', '') or '')) for r in records if str(r.vendor.get('userName', '') or '').strip()).values() if c > 1)}")

    local_tmp = Path(tempfile.gettempdir())
    json_path = local_tmp / "legacy_vendors_genuine.json"
    script_path = local_tmp / "import_legacy_vendors_remote.py"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(args.ssh_host, username=args.ssh_user, password=args.ssh_password, timeout=20, banner_timeout=20, auth_timeout=20)

    payload = build_export(records, ssh, args.db_name)

    with json_path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)

    remote_script = """\
import datetime as dt
import json
import secrets
import subprocess
import sys
from decimal import Decimal

try:
    import psycopg2
    from psycopg2.extras import Json
except ModuleNotFoundError:
    subprocess.run([sys.executable, '-m', 'pip', 'install', '--user', 'psycopg2-binary'], check=True)
    import psycopg2
    from psycopg2.extras import Json

DATA_PATH = sys.argv[1]
DB_NAME = '__DB_NAME__'


def parse_dt(value):
    if not value:
        return None
    text = str(value).strip().replace('Z', '+00:00')
    try:
        return dt.datetime.fromisoformat(text)
    except ValueError:
        for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d'):
            try:
                return dt.datetime.strptime(text, fmt)
            except ValueError:
                continue
    return None


def hash_password(password: str) -> str:
    import hashlib
    salt = secrets.token_hex(16)
    derived = hashlib.scrypt(password.encode('utf-8'), salt=salt.encode('utf-8'), n=16384, r=8, p=1, dklen=64)
    return f'scrypt:{{salt}}:{{derived.hex()}}'


with open(DATA_PATH, 'r', encoding='utf-8') as fh:
    rows = json.load(fh)

conn = psycopg2.connect(dbname=DB_NAME, user='postgres', host='/var/run/postgresql')
conn.autocommit = False
cur = conn.cursor()

user_sql = '''\
INSERT INTO users (id, name, email, phone, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = COALESCE(EXCLUDED.phone, users.phone),
  "passwordHash" = EXCLUDED."passwordHash",
  role = EXCLUDED.role,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = EXCLUDED."updatedAt"
RETURNING id;
'''

vendor_sql = '''\
INSERT INTO vendors (
  id, "userId", old_vendor_id, "companyName", "contactPerson", email, phone, about,
  "firstName", "lastName", "userName", "primaryEmail", telephone, "primaryMobile",
  specialization, "businessLocation", "visaType", address, "tradeLicenseNumber", "vatNumber",
  "updatedProfile", status, cities, "capacityPerDay", "commissionPercent", "planDetails",
  "planExpiry", "agreementFileUrl", "agreementFileKey", "bankName", "accountFullName",
  "ibanNo", "accountNumber", swift, "branchAddress", "appleId", "countryCode",
  "deviceToken", "estCardExpiry", "facebookId", "googleId", "imageUrl", "inviteCode",
  "isBlocked", "isDeleted", "isPremium", "isVerified", "noOfPartners", password,
  "tradeExpiry", "createdAt", "updatedAt"
)
VALUES (
  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
ON CONFLICT (old_vendor_id) DO UPDATE SET
  "userId" = EXCLUDED."userId",
  "companyName" = EXCLUDED."companyName",
  "contactPerson" = EXCLUDED."contactPerson",
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  about = EXCLUDED.about,
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "userName" = EXCLUDED."userName",
  "primaryEmail" = EXCLUDED."primaryEmail",
  telephone = EXCLUDED.telephone,
  "primaryMobile" = EXCLUDED."primaryMobile",
  specialization = EXCLUDED.specialization,
  "businessLocation" = EXCLUDED."businessLocation",
  "visaType" = EXCLUDED."visaType",
  address = EXCLUDED.address,
  "tradeLicenseNumber" = EXCLUDED."tradeLicenseNumber",
  "vatNumber" = EXCLUDED."vatNumber",
  "updatedProfile" = EXCLUDED."updatedProfile",
  status = EXCLUDED.status,
  cities = EXCLUDED.cities,
  "capacityPerDay" = EXCLUDED."capacityPerDay",
  "commissionPercent" = EXCLUDED."commissionPercent",
  "planDetails" = EXCLUDED."planDetails",
  "planExpiry" = EXCLUDED."planExpiry",
  "agreementFileUrl" = EXCLUDED."agreementFileUrl",
  "agreementFileKey" = EXCLUDED."agreementFileKey",
  "bankName" = EXCLUDED."bankName",
  "accountFullName" = EXCLUDED."accountFullName",
  "ibanNo" = EXCLUDED."ibanNo",
  "accountNumber" = EXCLUDED."accountNumber",
  swift = EXCLUDED.swift,
  "branchAddress" = EXCLUDED."branchAddress",
  "appleId" = EXCLUDED."appleId",
  "countryCode" = EXCLUDED."countryCode",
  "deviceToken" = EXCLUDED."deviceToken",
  "estCardExpiry" = EXCLUDED."estCardExpiry",
  "facebookId" = EXCLUDED."facebookId",
  "googleId" = EXCLUDED."googleId",
  "imageUrl" = EXCLUDED."imageUrl",
  "inviteCode" = EXCLUDED."inviteCode",
  "isBlocked" = EXCLUDED."isBlocked",
  "isDeleted" = EXCLUDED."isDeleted",
  "isPremium" = EXCLUDED."isPremium",
  "isVerified" = EXCLUDED."isVerified",
  "noOfPartners" = EXCLUDED."noOfPartners",
  password = EXCLUDED.password,
  "tradeExpiry" = EXCLUDED."tradeExpiry",
  "updatedAt" = EXCLUDED."updatedAt"
RETURNING id;
'''

imported = 0
for row in rows:
    user = row['user']
    vendor = row['vendor']

    cur.execute(
        user_sql,
        (
            user['id'],
            user['name'],
            user['email'],
            user['phone'],
            user['passwordHash'],
            user['role'],
            user['isActive'],
            parse_dt(user['createdAt']) or dt.datetime.utcnow(),
            parse_dt(user['updatedAt']) or dt.datetime.utcnow(),
        ),
    )
    user_id = cur.fetchone()[0]

    cur.execute(
        vendor_sql,
        (
            vendor['id'],
            user_id,
            vendor['oldVendorId'],
            vendor['companyName'],
            vendor['contactPerson'],
            vendor['email'],
            vendor['phone'],
            vendor['about'],
            vendor['firstName'],
            vendor['lastName'],
            vendor['userName'],
            vendor['primaryEmail'],
            vendor['telephone'],
            vendor['primaryMobile'],
            vendor['specialization'],
            vendor['businessLocation'],
            vendor['visaType'],
            vendor['address'],
            vendor['tradeLicenseNumber'],
            vendor['vatNumber'],
            vendor['updatedProfile'],
            vendor['status'],
            vendor['cities'],
            vendor['capacityPerDay'],
            Decimal(str(vendor['commissionPercent'])),
            vendor['planDetails'],
            parse_dt(vendor['planExpiry']),
            vendor['agreementFileUrl'],
            vendor['agreementFileKey'],
            vendor['bankName'],
            vendor['accountFullName'],
            vendor['ibanNo'],
            vendor['accountNumber'],
            vendor['swift'],
            vendor['branchAddress'],
            vendor['appleId'],
            vendor['countryCode'],
            vendor['deviceToken'],
            vendor['estCardExpiry'],
            vendor['facebookId'],
            vendor['googleId'],
            Json(vendor['imageUrl']) if vendor['imageUrl'] is not None else None,
            vendor['inviteCode'],
            vendor['isBlocked'],
            vendor['isDeleted'],
            vendor['isPremium'],
            vendor['isVerified'],
            vendor['noOfPartners'],
            vendor['password'],
            vendor['tradeExpiry'],
            parse_dt(vendor['createdAt']) or dt.datetime.utcnow(),
            parse_dt(vendor['updatedAt']) or dt.datetime.utcnow(),
        ),
    )
    cur.fetchone()
    imported += 1

conn.commit()
cur.close()
conn.close()
print(f'IMPORTED={imported}')
"""

    remote_script = remote_script.replace("__DB_NAME__", args.db_name)

    with script_path.open("w", encoding="utf-8") as fh:
        fh.write(remote_script)

    sftp = ssh.open_sftp()
    sftp.put(str(json_path), args.remote_json)
    sftp.put(str(script_path), args.remote_script)
    sftp.close()

    cmd = f"python3 {args.remote_script} {args.remote_json}"
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    if out:
        print(out.encode("utf-8", errors="replace").decode("utf-8"))
    if err:
        print(err.encode("utf-8", errors="replace").decode("utf-8"))
    if code != 0:
        raise SystemExit(code)

    for verify in [
        "SELECT COUNT(*) FROM vendors WHERE old_vendor_id IS NOT NULL;",
        "SELECT COUNT(*) FROM users WHERE role='VENDOR';",
        "SELECT COUNT(*) FROM vendors WHERE old_vendor_id IS NOT NULL AND password='Vendor123';",
    ]:
        stdin, stdout, stderr = ssh.exec_command(f'psql -U postgres -d {args.db_name} -Atqc "{verify}"')
        print(stdout.read().decode().strip())
        verr = stderr.read().decode().strip()
        if verr:
            print(verr)

    ssh.close()
    print(f"JSON: {json_path}")
    print(f"SCRIPT: {script_path}")


if __name__ == "__main__":
    main()
