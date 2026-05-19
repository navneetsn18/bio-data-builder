import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Upload, Download, ArrowUp, ArrowDown } from "lucide-react";
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
      { id: uid(), label: "Sub Caste", value: "" },
      { id: uid(), label: "Highest Education", value: "" },
      { id: uid(), label: "Job/Occupation", value: "" },
      { id: uid(), label: "Organization Name", value: "" },
      { id: uid(), label: "Expertise Languages", value: "" },
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
      { id: uid(), label: "Married Brothers", value: "" },
      { id: uid(), label: "Married Sisters", value: "" },
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

const LOCAL_STORAGE_KEY = "biodata-builder-state-v1";

type PersistedDraft = {
  sections: Section[];
  photo: string | null;
};

const isPersistedDraft = (value: unknown): value is PersistedDraft => {
  if (!value || typeof value !== "object") return false;

  const draft = value as { sections?: unknown; photo?: unknown };
  if (!(draft.photo === null || typeof draft.photo === "string")) return false;
  if (!Array.isArray(draft.sections)) return false;

  return draft.sections.every((section) => {
    if (!section || typeof section !== "object") return false;
    const maybeSection = section as { id?: unknown; title?: unknown; fields?: unknown };
    if (
      typeof maybeSection.id !== "string" ||
      typeof maybeSection.title !== "string" ||
      !Array.isArray(maybeSection.fields)
    ) {
      return false;
    }

    return maybeSection.fields.every((field) => {
      if (!field || typeof field !== "object") return false;
      const maybeField = field as { id?: unknown; label?: unknown; value?: unknown };
      return (
        typeof maybeField.id === "string" &&
        typeof maybeField.label === "string" &&
        typeof maybeField.value === "string"
      );
    });
  });
};

function BiodataBuilder() {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [photo, setPhoto] = useState<string | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!isPersistedDraft(parsed)) return;

      // Merge any missing default sections/fields so new defaults appear for existing users
      const mergedSections: Section[] = defaultSections.map((def) => {
        const existing = parsed.sections.find((s: Section) => s.title === def.title);
        if (!existing) return def;

        // Build map of existing fields by label for quick lookup
        const existingByLabel = new Map<string, Field>();
        existing.fields.forEach((f: Field) => existingByLabel.set(f.label, f));

        // Keep default order: use existing field if present, otherwise add default placeholder
        const mergedFields: Field[] = def.fields.map((df) => {
          const ex = existingByLabel.get(df.label);
          return ex ? { ...ex } : { id: uid(), label: df.label, value: "" };
        });

        // Append any user-created fields that are not part of defaults (preserve user's additions)
        const defaultLabels = new Set(def.fields.map((f) => f.label));
        const extraUserFields = existing.fields.filter((f) => !defaultLabels.has(f.label));

        return { ...existing, fields: [...mergedFields, ...extraUserFields] };
      });

      // include any user-created sections that aren't part of defaults
      const extra = parsed.sections.filter(
        (s: Section) => !defaultSections.some((d) => d.title === s.title),
      );

      setSections([...mergedSections, ...extra]);
      setPhoto(parsed.photo);
    } catch (error) {
      console.error(error);
    } finally {
      setHasLoadedDraft(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;

    try {
      const draft: PersistedDraft = { sections, photo };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error(error);
    }
  }, [sections, photo, hasLoadedDraft]);

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

  const moveField = (sid: string, fid: string, direction: "up" | "down") => {
    setSections((s) =>
      s.map((sec) => {
        if (sec.id !== sid) return sec;

        const currentIndex = sec.fields.findIndex((field) => field.id === fid);
        if (currentIndex === -1) return sec;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= sec.fields.length) return sec;

        const nextFields = [...sec.fields];
        [nextFields[currentIndex], nextFields[targetIndex]] = [
          nextFields[targetIndex],
          nextFields[currentIndex],
        ];

        return { ...sec, fields: nextFields };
      })
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

  const resetDraft = () => {
    if (!confirm("Reset draft? This will clear saved data.")) return;
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setSections(defaultSections);
    setPhoto(null);
    toast.success("Draft cleared");
  };

  const exportPdf = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const clonedElement = previewRef.current.cloneNode(true) as HTMLElement;
      
      // Apply solid background color + remove oklch colors
      const style = document.createElement("style");
      style.textContent = `
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&display=swap");
        .biodata-page { background: #eef0dc !important; font-family: 'Cormorant Garamond', serif !important; color: #2d3a4a !important; }
        .biodata-page * { color: #2d3a4a !important; font-family: 'Cormorant Garamond', serif !important; }
        .biodata-page .corner, .biodata-page .hborder { pointer-events: none; }
        svg { display: none !important; }
      `;
      clonedElement.appendChild(style);
      
      // Append to DOM temporarily
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.appendChild(clonedElement);
      document.body.appendChild(container);
      
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        backgroundColor: "#eef0dc",
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: false,
      });
      
      document.body.removeChild(container);
      
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      
      // Fit to 1 page
      const ratio = canvas.height / canvas.width;
      const imgH = pageW * ratio;
      const scale = imgH > pageH ? pageH / imgH : 1;
      const finalH = imgH * scale;
      
      const img = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(img, "JPEG", 0, 0, pageW, finalH);
      
      pdf.save("biodata.pdf");
      toast.success("PDF downloaded");
    } catch (e) {
      console.error("PDF error:", e);
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={resetDraft}>
              Reset
            </Button>
            <Button onClick={exportPdf} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-screen-l gap-6 px-6 py-6 lg:grid-cols-[1fr_800px]">
        {/* Editor */}
        <div className="space-y-4 pr-8">
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
                {sec.fields.map((f, idx) => (
                  <div key={f.id} className="grid grid-cols-[310px_1fr_120px] gap-2 items-center">
                    <Input
                      value={f.label}
                      onChange={(e) => updateField(sec.id, f.id, "label", e.target.value)}
                      placeholder="Label"
                      className="text-lg py-2 px-2 font-extrabold"
                    />
                    <Input
                      value={f.value}
                      onChange={(e) => updateField(sec.id, f.id, "value", e.target.value)}
                      placeholder="Value"
                      className="text-lg py-3 px-3 min-w-[58ch] font-normal"
                    />
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => moveField(sec.id, f.id, "up")}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === sec.fields.length - 1}
                        onClick={() => moveField(sec.id, f.id, "down")}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(sec.id, f.id)}
                        title="Delete field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
