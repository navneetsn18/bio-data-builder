import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Upload, Download } from "lucide-react";
import { BiodataPreview, type Section } from "@/components/BiodataPreview";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: BiodataBuilder,
  head: () => ({
    meta: [
      { title: "Marriage Biodata Generator — Create & Download PDF" },
      {
        name: "description",
        content:
          "Create a beautiful traditional marriage biodata. Add, edit, and remove fields, attach a photo, and export to PDF.",
      },
    ],
  }),
});

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultSections: Section[] = [
  {
    id: uid(),
    title: "Personal Details",
    fields: [
      { id: uid(), label: "Name", value: "" },
      { id: uid(), label: "Gender", value: "" },
      { id: uid(), label: "Date Of Birth", value: "" },
      { id: uid(), label: "Place Of Birth", value: "" },
      { id: uid(), label: "Native", value: "" },
      { id: uid(), label: "Time Of Birth", value: "" },
      { id: uid(), label: "Rashi", value: "" },
      { id: uid(), label: "Nakshatra", value: "" },
      { id: uid(), label: "Height", value: "" },
      { id: uid(), label: "Marital Status", value: "" },
      { id: uid(), label: "Religion", value: "" },
      { id: uid(), label: "Mother Tongue", value: "" },
      { id: uid(), label: "Caste", value: "" },
      { id: uid(), label: "Highest Education", value: "" },
      { id: uid(), label: "Job/Occupation", value: "" },
    ],
  },
  {
    id: uid(),
    title: "Family Details",
    fields: [
      { id: uid(), label: "Father's Name", value: "" },
      { id: uid(), label: "Father's Occupation", value: "" },
      { id: uid(), label: "Mother's Name", value: "" },
      { id: uid(), label: "Mother's Occupation", value: "" },
      { id: uid(), label: "Total Brothers", value: "" },
      { id: uid(), label: "Total Sisters", value: "" },
    ],
  },
  {
    id: uid(),
    title: "Contact Information",
    fields: [
      { id: uid(), label: "Address", value: "" },
      { id: uid(), label: "Phone", value: "" },
    ],
  },
];

function BiodataBuilder() {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateField = (sid: string, fid: string, key: "label" | "value", v: string) => {
    setSections((s) =>
      s.map((sec) =>
        sec.id === sid
          ? {
              ...sec,
              fields: sec.fields.map((f) => (f.id === fid ? { ...f, [key]: v } : f)),
            }
          : sec
      )
    );
  };

  const addField = (sid: string) => {
    setSections((s) =>
      s.map((sec) =>
        sec.id === sid
          ? { ...sec, fields: [...sec.fields, { id: uid(), label: "New Field", value: "" }] }
          : sec
      )
    );
  };

  const removeField = (sid: string, fid: string) => {
    setSections((s) =>
      s.map((sec) =>
        sec.id === sid ? { ...sec, fields: sec.fields.filter((f) => f.id !== fid) } : sec
      )
    );
  };

  const updateSectionTitle = (sid: string, title: string) => {
    setSections((s) => s.map((sec) => (sec.id === sid ? { ...sec, title } : sec)));
  };

  const addSection = () => {
    setSections((s) => [...s, { id: uid(), title: "New Section", fields: [] }]);
  };

  const removeSection = (sid: string) => {
    setSections((s) => s.filter((sec) => sec.id !== sid));
  };

  const onPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const exportPdf = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const h = pageW * ratio;
      if (h <= pageH) {
        pdf.addImage(img, "JPEG", 0, 0, pageW, h);
      } else {
        // Multi-page split
        const pageHpx = (canvas.width * pageH) / pageW;
        let y = 0;
        while (y < canvas.height) {
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = Math.min(pageHpx, canvas.height - y);
          const ctx = slice.getContext("2d")!;
          ctx.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          const simg = slice.toDataURL("image/jpeg", 0.95);
          const sh = (slice.height * pageW) / slice.width;
          if (y > 0) pdf.addPage();
          pdf.addImage(simg, "JPEG", 0, 0, pageW, sh);
          y += slice.height;
        }
      }
      pdf.save("biodata.pdf");
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Toaster />
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Marriage Biodata Generator</h1>
            <p className="text-sm text-muted-foreground">
              Fill in your details, attach a photo, and export to PDF.
            </p>
          </div>
          <Button onClick={exportPdf} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_840px]">
        {/* Editor */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div>
              <Label>Photo</Label>
              <div className="flex items-center gap-3 mt-1">
                {photo && (
                  <img src={photo} alt="" className="h-16 w-12 object-cover rounded border" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("photo-input")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPhoto(f);
                    e.target.value = "";
                  }}
                />
                {photo && (
                  <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>


          {sections.map((sec) => (
            <Card key={sec.id} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={sec.title}
                  onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                  className="font-semibold"
                />
                <Button variant="ghost" size="icon" onClick={() => removeSection(sec.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {sec.fields.map((f) => (
                  <div key={f.id} className="grid grid-cols-[200px_1fr_auto] gap-2">
                    <Input
                      value={f.label}
                      onChange={(e) => updateField(sec.id, f.id, "label", e.target.value)}
                      placeholder="Label"
                    />
                    <Input
                      value={f.value}
                      onChange={(e) => updateField(sec.id, f.id, "value", e.target.value)}
                      placeholder="Value"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(sec.id, f.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => addField(sec.id)}>
                <Plus className="mr-2 h-4 w-4" /> Add Field
              </Button>
            </Card>
          ))}

          <Button variant="outline" onClick={addSection} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Section
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-auto rounded-lg border bg-white shadow-sm">
            <div style={{ transform: "scale(1)", transformOrigin: "top left" }}>
              <BiodataPreview ref={previewRef} sections={sections} photo={photo} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
