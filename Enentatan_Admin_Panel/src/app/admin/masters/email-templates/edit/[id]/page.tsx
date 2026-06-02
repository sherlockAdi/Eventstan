"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/api/adminApi";
import Button from "@/components/admin/Button";
import Input from "@/components/admin/Input";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  subject: "",
  trigger: "",
  body: "",
  status: "Active",
};

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const template = await adminApi.emailTemplates.get(id);
        if (!template) {
          toast.error("Template not found");
          router.push("/admin/masters/email-templates");
          return;
        }
        setForm({
          name: template.name || "",
          subject: template.subject || "",
          trigger: template.trigger || "",
          body: template.body || "",
          status: template.status || "Active",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, router]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.subject || !form.trigger || !form.body) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      await adminApi.emailTemplates.update(id, form);
      toast.success("Email template updated");
      router.push("/admin/masters/email-templates");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading template...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/masters/email-templates"><button className="p-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /></button></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Email Template</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update a database-backed email template</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Input label="Template Name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required />
            <Input label="Subject" value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} required />
            <Input label="Trigger" value={form.trigger} onChange={event => setForm({ ...form, trigger: event.target.value })} required />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Body</label>
            <textarea value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} rows={12} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono" required />
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/admin/masters/email-templates"><Button type="button" variant="secondary">Cancel</Button></Link>
            <Button type="submit" disabled={saving}><Save size={15} />{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
