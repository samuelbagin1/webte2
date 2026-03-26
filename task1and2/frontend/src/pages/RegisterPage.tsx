import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Link } from "react-router-dom";

// registration form: first_name, last_name, email, password, password_repeat -> navigate to 2fa setup page

// POST /api/auth/register 
// {first_name, last_name, email, password, password_repeat} -> {message,  tfa, qr_code}

export function RegisterPage() {
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
                <RegisterForm />

                <p className="text-center text-sm text-muted-foreground">
                    Už máte účet?{" "}
                    <Link to="/login" className="underline font-medium text-primary">
                        Prihláste sa
                    </Link>
                </p>
            </CardContent>

        </Card>
    </div>
  );
}