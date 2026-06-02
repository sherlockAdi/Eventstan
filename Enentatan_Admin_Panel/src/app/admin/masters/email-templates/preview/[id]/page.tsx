'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/admin/Button';

const emailHeader = `...`; // Same as above
const emailFooter = `...`; // Same as above

const getTemplate = (id: number): any => {
  const templates = [
    { id: 1, name: 'Welcome Email', subject: 'Welcome to EventStan!', trigger: 'User Registration', body: 'Dear {{name}},\n\nWelcome to EventStan! We are excited to have you on board.\n\nBest regards,\nEventStan Team', status: 'Active' },
    { id: 2, name: 'Booking Confirmation', subject: 'Your Booking #{{bookingId}} is Confirmed!', trigger: 'Booking Confirmed', body: 'Dear {{name}},\n\nYour booking #{{bookingId}} has been confirmed for {{date}}.\n\nVendor: {{vendorName}}\nAmount: ₹{{amount}}\n\nThank you for choosing EventStan!', status: 'Active' },
  ];
  return templates.find(t => t.id === id);
};

export default function PreviewEmailTemplate() {
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const t = getTemplate(parseInt(id));
      setTemplate(t);
    }
  }, [id]);

  const getFullEmailPreview = (body: string) => {
    return emailHeader + body.replace(/\n/g, '<br>') + emailFooter;
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/masters/email-templates">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Preview: {template.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Email template preview with header and footer</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/masters/email-templates/edit/${id}`}>
            <Button>Edit Template</Button>
          </Link>
          <Link href="/admin/masters/email-templates">
            <Button variant="secondary">Back to List</Button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
        <div className="flex gap-2 mb-3 text-sm">
          <span className="font-semibold text-gray-700">Subject:</span>
          <span className="text-gray-600">{template.subject}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-semibold text-gray-700">Trigger:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{template.trigger}</span>
        </div>
        <div className="flex gap-2 text-sm mt-2">
          <span className="font-semibold text-gray-700">Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${template.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {template.status}
          </span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ height: '70vh' }}>
        <iframe
          srcDoc={getFullEmailPreview(template.body)}
          className="w-full h-full border-0"
          title="Full Email Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}