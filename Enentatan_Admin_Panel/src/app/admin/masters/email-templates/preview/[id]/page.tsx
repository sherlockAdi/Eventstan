"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/api/adminApi";
import Button from "@/components/admin/Button";
import toast from "react-hot-toast";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  trigger: string;
  body: string;
  status: string;
}

const emailShell = (body: string) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 24px; background: #f3f4f6; font-family: Arial, sans-serif; color: #374151; }
      .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
      .header { background: #f97316; color: #ffffff; padding: 28px 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; }
      .content { padding: 32px; line-height: 1.6; }
      .footer { padding: 20px 24px; background: #f9fafb; color: #6b7280; font-size: 12px; text-align: center; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>EventStan</h1></div>
      <div class="content">${body}</div>
      <div class="footer">EventStan notification email</div>
    </div>
  </body>
</html>
`;

export default function PreviewEmailTemplatePage() {
  const params = useParams();
  const id = Number(params?.id);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setTemplate(await adminApi.emailTemplates.get(id));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    if (id) void load();
  }, [id]);

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading preview...</div>;
  if (!template) return <div className="text-sm text-gray-500">Template not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/masters/email-templates"><button className="p-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /></button></Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Preview: {template.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{template.subject}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/masters/email-templates/edit/${id}`}><Button>Edit Template</Button></Link>
          <Link href="/admin/masters/email-templates"><Button variant="secondary">Back</Button></Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-sm">
        <div><span className="font-semibold text-gray-700">Trigger:</span> {template.trigger}</div>
        <div className="mt-2"><span className="font-semibold text-gray-700">Status:</span> {template.status}</div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ height: "70vh" }}>
        <iframe srcDoc={emailShell(template.body)} className="w-full h-full border-0" title="Email Preview" />
      </div>
    </div>
  );
}
