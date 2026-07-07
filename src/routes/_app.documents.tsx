import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Download, Trash2, FileText, FileImage, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { documentsSeed, type Document } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentsPage,
});

const iconFor = (t: Document["type"]) => {
  switch (t) {
    case "PDF": return { Icon: FileText, tint: "bg-rose-50 text-rose-600" };
    case "Image": return { Icon: FileImage, tint: "bg-blue-50 text-blue-600" };
    case "Spreadsheet": return { Icon: FileSpreadsheet, tint: "bg-emerald-50 text-emerald-600" };
    case "Word": return { Icon: FileType, tint: "bg-indigo-50 text-indigo-600" };
  }
};

function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>(documentsSeed);

  const remove = (id: string) => {
    setDocs(d => d.filter(x => x.id !== id));
    toast.success("Document deleted");
  };
  const download = (name: string) => toast.success(`Downloading ${name}`);
  const upload = () => toast.success("Upload started (mock)");

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-500 mt-1">Company files and personal records.</p>
        </div>
        <Button onClick={upload} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map(d => {
          const { Icon, tint } = iconFor(d.type);
          return (
            <Card key={d.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-md grid place-items-center shrink-0 ${tint}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{d.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{d.type} · {d.size}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Uploaded {d.uploaded}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => download(d.name)}>
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(d.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
