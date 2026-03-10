import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Link } from "react-router-dom";

// login page with two auth methods: local and google

// POST /api/auth/login
// {email, password, totp} -> {message, user}

// GET /api/auth/google
// {url} -> redirection to google

export function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">

            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Prihlásenie</CardTitle>
                <CardDescription>
                    Prihláste sa lokálnym účtom alebo cez Google
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Local login form */}
                <LoginForm />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">alebo</span>
                    </div>
                </div>

                {/* Google OAuth */}
                <GoogleLoginButton />

                {/* Register link */}
                <p className="text-center text-sm text-muted-foreground">
                    Nemáte účet?{" "}
                    <Link to="/register" className="underline font-medium text-primary">
                        Zaregistrujte sa
                    </Link>
                </p>
            </CardContent>

        </Card>
    </div>
  )
}
