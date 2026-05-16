"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface AddDialogProps {
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, string | null>) => Promise<void>;
}

export function AddDialog({ title, fields, onSubmit }: AddDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | null>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({});
      setOpen(false);
      window.location.reload();
    } catch {
      alert("提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        添加
      </Button>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>填写信息后即可创建新条目</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={form[field.name] || ""}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                />
              ) : field.type === "select" ? (
                <Select
                  value={form[field.name] || ""}
                  onValueChange={(value: string | null) => setForm({ ...form, [field.name]: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`选择${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === "number" ? "number" : "text"}
                  value={form[field.name] || ""}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "提交中..." : "提交"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
