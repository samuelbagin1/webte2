import { useState, useEffect } from "react";
import api from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// display login history table for the current user

// GET /api/users/{id}/login-history
// {} -> [{id, login_type, created_at}]

interface LoginEntry {
    id: number;
    login_type: "LOCAL" | "OAUTH";
    created_at: string;
}


export function LoginHistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<LoginEntry[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const {data} = await api.get(`/users/${user?.id}/login-history`);
                setHistory(data);

            } catch {
                setHistory([]);

            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }


    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">História prihlásení</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Posledné prihlásenia</CardTitle>
                </CardHeader>

                <CardContent>
                    <Table>
                        
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dátum a čas</TableHead>
                                <TableHead>Spôsob prihlásenia</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {history.length === 0 ? (

                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                        Žiadne záznamy o prihlásení.
                                    </TableCell>
                                </TableRow>

                                ) : (

                                history.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            {new Date(entry.created_at).toLocaleString("sk-SK")}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={entry.login_type === "OAUTH" ? "secondary" : "default"}>
                                                {entry.login_type === "OAUTH" ? "Google" : "Lokálne"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))

                            )}
                        </TableBody>

                    </Table>
                </CardContent>
            </Card>

        </div>
    )
}
