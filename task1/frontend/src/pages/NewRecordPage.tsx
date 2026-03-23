import { NewRecordForm } from "@/components/import/NewRecordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// login page with two auth methods: local and google

// POST /api/auth/login
// {email, password, totp} -> {message, user}

// GET /api/auth/google
// {url} -> redirection to google

export function NewRecordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-[50vw]">
                
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Nový záznam atléta</CardTitle>
                    <CardDescription>
                        Vytvorte si nový záznam atléta
                    </CardDescription>
                </CardHeader>
    
                <CardContent className="space-y-6">
                    <NewRecordForm />
                </CardContent>
    
            </Card>
        </div>
  )
}
