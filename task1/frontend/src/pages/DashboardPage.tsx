import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, History, Upload } from "lucide-react";

// private zone landing page

export function DashboardPage() {
    const { user } = useAuth();


    return (
        <div className="space-y-6">
            {/* Welcome card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Vitajte, {user?.full_name}!
                    </CardTitle>

                    <CardDescription className="flex items-center gap-2">
                        Prihlásený ako {user?.email}
                        <Badge variant="outline">
                            {user?.login_type === "OAUTH" ? "Google účet" : "Lokálny účet"}
                        </Badge>
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Quick actions grid */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Settings className="h-5 w-5" />
                            Profil
                        </CardTitle>

                        <CardDescription>
                            Zmeniť meno, priezvisko alebo heslo
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Link to="/profile">
                            <Button variant="outline" className="w-full">Upraviť profil</Button>
                        </Link>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <History className="h-5 w-5" />
                            História prihlásení
                        </CardTitle>

                        <CardDescription>
                            Zobraziť históriu prihlásení pre váš účet
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Link to="/login-history">
                            <Button variant="outline" className="w-full">Zobraziť históriu</Button>
                        </Link>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Upload className="h-5 w-5" />
                            Import dát
                        </CardTitle>

                        <CardDescription>
                            Importovať nové dáta zo súboru XLSX/CSV
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Link to="/import">
                            <Button variant="outline" className="w-full">Importovať</Button>
                        </Link>
                    </CardContent>
                </Card>
                
            </div>
        </div>
    )
}
