import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JsonUpload } from "@/components/import/JsonUpload";

// private zone - file upload input for xlsx/csv

// POST /api/import

// DELETE /api/import

export function ImportJsonPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Správa dát</h1>

            {/* File upload section */}
            <Card>
                <CardHeader>
                    <CardTitle>Import dát</CardTitle>

                    <CardDescription>
                        Nahrajte súbor vo formáte JSON s dátami olympionikov.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <JsonUpload />
                </CardContent>
            </Card>
        </div>
    )
}
