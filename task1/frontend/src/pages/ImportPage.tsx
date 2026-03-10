import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/import/FileUpload";
import { DeleteDataButton } from "@/components/import/DeleteDataButton";

// private zone - file upload input for xlsx/csv

// POST /api/import

// DELETE /api/import

export function ImportPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Správa dát</h1>

            {/* File upload section */}
            <Card>
                <CardHeader>
                    <CardTitle>Import dát</CardTitle>

                    <CardDescription>
                        Nahrajte súbor vo formáte XLSX alebo CSV s dátami olympionikov.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <FileUpload />
                </CardContent>
            </Card>

            <Separator />

            {/* Delete data section */}
            <Card>
                <CardHeader>
                    <CardTitle>Vymazanie dát</CardTitle>

                    <CardDescription>
                        Vymazať všetky olympijské dáta z databázy. Po vymazaní je možné dáta znova importovať.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <DeleteDataButton />
                </CardContent>
            </Card>
        </div>
    )
}
