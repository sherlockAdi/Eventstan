'use client';

import { useState } from 'react';
import { Plus, Mail, Eye, Edit, Trash2, X, Maximize2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import Table from '@/components/admin/Table';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface EmailTemplate { id: number; name: string; subject: string; trigger: string; body: string; status: string; }

const initialData: EmailTemplate[] = [
  { id: 1, name: 'Welcome Email', subject: 'Welcome to EventStan!', trigger: 'User Registration', body: '<p>Dear {{name}},</p><p>Welcome to EventStan! We are excited to have you on board.</p><p>Best regards,<br>EventStan Team</p>', status: 'Active' },
  { id: 2, name: 'Booking Confirmation', subject: 'Your Booking #{{bookingId}} is Confirmed!', trigger: 'Booking Confirmed', body: '<p>Dear {{name}},</p><p>Your booking #{{bookingId}} has been confirmed for {{date}}.</p><p><strong>Vendor:</strong> {{vendorName}}<br><strong>Amount:</strong> ₹{{amount}}</p><p>Thank you for choosing EventStan!</p>', status: 'Active' },
  { id: 3, name: 'Vendor Approval', subject: 'Your Vendor Account is Approved!', trigger: 'Vendor Approved', body: '<p>Dear {{vendorName}},</p><p>Congratulations! Your vendor account has been approved.</p><p>You can now start listing your services on EventStan.</p>', status: 'Active' },
  { id: 4, name: 'Payment Receipt', subject: 'Payment Receipt - ₹{{amount}}', trigger: 'Payment Received', body: '<p>Dear {{name}},</p><p>We have received your payment of <strong>₹{{amount}}</strong> for booking #{{bookingId}}.</p><p>Thank you!</p>', status: 'Active' },
  { id: 5, name: 'Password Reset', subject: 'Reset Your EventStan Password', trigger: 'Password Reset Request', body: '<p>Dear {{name}},</p><p>Click the link below to reset your password:</p><p><a href="{{resetLink}}" style="color: #f97316;">Reset Password</a></p><p>This link expires in 24 hours.</p>', status: 'Inactive' },
];

// Fixed Header Template
const emailHeader = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EventStan Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      background-color: #f3f4f6;
    }
    
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
    }
    
    .header { 
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
      padding: 32px 24px; 
      text-align: center; 
    }
    
    .header h1 { 
      color: white; 
      margin: 0; 
      font-size: 28px; 
      font-weight: bold; 
      letter-spacing: -0.5px; 
    }
    
    .header p { 
      color: rgba(255,255,255,0.9); 
      margin: 8px 0 0; 
      font-size: 14px; 
    }
    
    .content { 
      padding: 40px 32px; 
      background-color: #ffffff; 
      line-height: 1.6; 
      color: #374151; 
    }
    
    .content p { 
      margin-bottom: 16px; 
    }
    
    .content strong { 
      color: #1f2937; 
    }
    
    .content a { 
      color: #f97316; 
      text-decoration: none; 
    }
    
    .content a:hover { 
      text-decoration: underline; 
    }
    
    .variable { 
      background-color: #fef3c7; 
      color: #d97706; 
      padding: 2px 6px; 
      border-radius: 6px; 
      font-family: monospace; 
      font-size: 0.9em; 
    }
    
    .footer { 
      background-color: #f9fafb; 
      padding: 24px; 
      text-align: center; 
      border-top: 1px solid #e5e7eb; 
    }
    
    .footer-text { 
      color: #6b7280; 
      font-size: 12px; 
      margin: 0; 
      line-height: 1.5; 
    }
    
    .social-links { 
      margin-top: 16px; 
    }
    
    .social-links a { 
      color: #f97316; 
      text-decoration: none; 
      margin: 0 8px; 
      font-size: 12px; 
    }
  </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div class="container">
    <div class="header">
      <h1>Event<span style="color: #fff3e6;">Stan</span></h1>
      <p>Your Event Planning Partner</p>
    </div>
    <div class="content">
`;

const emailFooter = `
    </div>
    <div class="footer">
      <p class="footer-text">© 2024 EventStan. All rights reserved.</p>
      <p class="footer-text">123 Event Street, Celebration City, EC 12345</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
      </div>
      <p class="footer-text" style="margin-top: 16px;">
        You received this email because you are registered with EventStan.<br>
        <a href="#" style="color: #f97316;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialData);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  const openStatusModal = (template: EmailTemplate) => {
    setSelected(template);
    const newStatus = template.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setTemplates(templates.map(t => 
        t.id === selected.id ? { ...t, status: pendingStatus } : t
      ));
      toast.success(`Template ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openDelete = (t: EmailTemplate) => { 
    setSelected(t); 
    setIsDeleteOpen(true); 
  };
  
  const openPreview = (t: EmailTemplate) => { 
    setSelected(t); 
    setIsPreviewOpen(true); 
  };

  const handleDelete = () => {
    if (selected) {
      setTemplates(templates.filter(t => t.id !== selected.id));
      toast.success('Template deleted successfully!');
    }
    setIsDeleteOpen(false);
  };

  const getFullEmailPreview = (body: string) => {
    const highlightedBody = body.replace(/\{\{(.*?)\}\}/g, '<span class="variable">{{$1}}</span>');
    return emailHeader + highlightedBody + emailFooter;
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Template Name', render: (v: string) => <div className="flex items-center gap-2"><Mail size={14} className="text-orange-400" /><span className="font-medium">{v}</span></div> },
    { key: 'subject', label: 'Subject', render: (v: string) => <span className="text-gray-600 text-xs">{v.length > 40 ? v.substring(0, 40) + '…' : v}</span> },
    { key: 'trigger', label: 'Trigger', render: (v: string) => <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{v}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: EmailTemplate) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            v === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {v}
          </span>
          <button
            onClick={() => openStatusModal(row)}
            className="text-gray-500 hover:text-orange-600 transition-colors"
            title={v === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {v === 'Active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: EmailTemplate) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openPreview(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" 
            title="Preview"
          >
            <Eye size={14} />
          </button>
          <Link href={`/admin/masters/email-templates/edit/${row.id}`}>
            <button 
              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" 
              title="Edit"
            >
              <Edit size={14} />
            </button>
          </Link>
          <button 
            onClick={() => openDelete(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" 
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{templates.length} templates · {templates.filter(t => t.status === 'Active').length} active</p>
        </div>
        <Link href="/admin/masters/email-templates/add">
          <Button><Plus size={15} />New Template</Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table 
          columns={columns} 
          data={templates}
        />
      </div>

      {/* Preview Modal with Beautiful Scrollbar */}
      {isPreviewOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Preview: {selected.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1 text-xs">
                  <div className="flex gap-1 items-center">
                    <span className="font-semibold text-gray-700">Subject:</span>
                    <span className="text-gray-600">{selected.subject}</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-semibold text-gray-700">Trigger:</span>
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{selected.trigger}</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-semibold text-gray-700">Status:</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${selected.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(getFullEmailPreview(selected.body));
                      newWindow.document.close();
                    }
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                  title="Open in new window"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Modal Body - Email Preview with Custom Scrollbar */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-gray-50"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#f97316 #fed7aa'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: #fed7aa;
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #f97316;
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #ea580c;
                }
              `}</style>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div 
                  dangerouslySetInnerHTML={{ __html: getFullEmailPreview(selected.body) }}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 shrink-0">
              <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Link href={`/admin/masters/email-templates/edit/${selected.id}`}>
                <Button onClick={() => setIsPreviewOpen(false)}>
                  Edit Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmModal 
        isOpen={isStatusModalOpen} 
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelected(null);
          setPendingStatus('');
        }} 
        onConfirm={confirmStatusChange} 
        title={pendingStatus === 'Active' ? 'Activate Template' : 'Deactivate Template'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} template "${selected?.name}"?`} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDelete} 
        title="Delete Template" 
        message={`Are you sure you want to delete template "${selected?.name}"? This action cannot be undone.`} 
      />
    </div>
  );
}