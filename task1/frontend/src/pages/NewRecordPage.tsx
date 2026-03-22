import { NewRecordForm } from "@/components/auth/NewRecordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Link } from "react-router-dom";

// login page with two auth methods: local and google

// POST /api/auth/login
// {email, password, totp} -> {message, user}

// GET /api/auth/google
// {url} -> redirection to google

export function NewRecordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-md">
                
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Registrácia</CardTitle>
                    <CardDescription>
                        Vytvorte si nový účet pre prístup do privátnej zóny
                    </CardDescription>
                </CardHeader>
    
                <CardContent className="space-y-6">
                    <NewRecordForm />
    
                    <p className="text-center text-sm text-muted-foreground">
                        Už máte účet?{" "}
                        <Link to="/login" className="underline font-medium text-primary">
                            Prihláste sa
                        </Link>
                    </p>
                </CardContent>
    
            </Card>
        </div>
  )
}
