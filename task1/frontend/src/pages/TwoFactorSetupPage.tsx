import { useLocation, Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// after registration: display qr code for google authenticator and the secret key for manual entry
// user must scan this before they can log in

// data source
// passed via useLocation().state from RegisterForm after successful reg

export function TwoFactorSetupPage() {
    const location = useLocation();
    const {qr_code, tfa_secret} = (location.state as {
        qr_code?: string;
        tfa_secret?: string;
    }) || {};


    // redirect if no qr data
    if (!qr_code || !tfa_secret) {
        return (<Navigate to="/register" replace />);
    }



  return (
    <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">

            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Nastavenie 2FA</CardTitle>
                <CardDescription>
                    Naskenujte QR kód v aplikácii Google Authenticator alebo zadajte kód manuálne
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* QR Code image */}
                <div className="flex justify-center">
                    <img
                        src={qr_code}
                        alt="2FA QR kód"
                        className="rounded-lg border p-2"
                        width={200}
                        height={200}
                    />
                </div>

                {/* Manual secret */}
                <div className="space-y-2">
                    <Label>Manuálny kód</Label>
                    <Input value={tfa_secret} readOnly className="font-mono text-center" />
                    <p className="text-xs text-muted-foreground text-center">
                        Ak nemôžete naskenovať QR kód, zadajte tento kód manuálne do vašej autentifikačnej aplikácie.
                    </p>
                </div>

                {/* Navigate to login */}
                <Link to="/login" className="block">
                    <Button className="w-full">Pokračovať na prihlásenie</Button>
                </Link>
            </CardContent>

        </Card>
    </div>
  )
}
