import {useState, useEffect} from "react";
import Cookies from "js-cookie";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

// cookie consent banner, shown on first visit
// required because we store personal data

const COOKIE_CONSENT_KEY = "cookie_consent";

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!Cookies.get(COOKIE_CONSENT_KEY)) {
            setVisible(true);
        }

    }, []);

    const handleAccept = () => {
        Cookies.set(COOKIE_CONSENT_KEY, "accepted", {expires: 365});
        setVisible(false);
    };


    return (
        <>
            {visible && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
                    <Card className="mx-auto max-w-2xl">

                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Táto stránka používa cookies na ukladanie informácií o prihlásení
                                a zabezpečenie správneho fungovania aplikácie.
                            </p>

                            <Button onClick={handleAccept} size="sm" className="shrink-0">Súhlasím</Button>
                        </CardContent>

                    </Card>
                </div>
            )}
        </>
    );
}