import { useState, useRef } from "react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";

// file input for xlsx/csv

// POST /api/athletes


export function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;

        if (selected) {
            const ext = selected.name.split(".").pop()?.toLowerCase();

            if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
                toast.error("Povolené formáty: XLSX, XLS, CSV");
                return;
            }

            setFile(selected);
        }
    };


    const handleUpload = async () => {
        if (!file) {
            toast.error("Vyberte súbor na import");
            return;
        }

        setUploading(true);
        try{
            const formData = new FormData();
            formData.append("file", file);

            const {data} = await api.post("/athletes", formData, {
                headers: {"Content-Type": "multipart/form-data"}
            });

            toast.success(data.message || "Import úspešný");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri importe";
            toast.error(message);

        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="file_upload">Súbor (XLSX, CSV)</Label>
                <Input
                    id="file_upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                />

                {file && (
                    <p className="text-sm text-muted-foreground">
                    Vybraný súbor: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                )}
            </div>

            <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? "Importujem..." : "Importovať dáta"}
            </Button>
        </div>
    );
}