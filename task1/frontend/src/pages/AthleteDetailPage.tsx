import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

// detail page for a single athlete, shows all data from provided file

// GET /api/athletes/:id


interface AthleteDetail {
    id: number;
    name: string;
    surname: string;
    birth_date: string;
    birth_place: string;
    birth_country: string;
    death_date: string | null;
    death_place: string | null;
    death_country: string | null;
    records: {
        year: number;
        type: string;
        city: string;
        host_country: string;
        discipline: string;
        placing: number;
    }[];
}

export function AthleteDetailPage() {
    const {id} = useParams<{id: string}>();
    const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchAthlete = async () => {
            try {
                const {data} = await api.get(`/athletes/${id}`);
                setAthlete(data);

            } catch {
                setAthlete(null);

            } finally {
                setLoading(false);
            }
        };

        fetchAthlete();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64, w-full" />
            </div>
        );
    }

    if (!athlete) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Olympionik nebol nájdený.</p>

                <Link to="/">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Späť na zoznam
                    </Button>
                </Link>
            </div>
        )
    }

    const placingLabel = (placing: number) => {
        switch (placing) {
            case 1: return "Zlato";
            case 2: return "Striebro";
            case 3: return "Bronz";
            default: return `${placing}. miesto`;
        }
    };

    const placingVariant = (placing: number) => {
        switch (placing) {
            case 1: return "default";
            case 2: return "secondary";
            case 3: return "outline";
            default: return "ghost";
        }
    };





  return (
    <div className="space-y-6">

        {/* Back navigation */}
        <Link to="/">
            <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Späť na zoznam
            </Button>
        </Link>

        {/* Personal info card */}
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">
                    {athlete.name} {athlete.surname}
                </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-muted-foreground">Dátum narodenia</p>
                    <p className="font-medium">
                        {new Date(athlete.birth_date).toLocaleDateString("sk-SK")}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Miesto narodenia</p>
                    <p className="font-medium">
                        {athlete.birth_place}, {athlete.birth_country}
                    </p>
                </div>

                {athlete.death_date && (
                    <>
                        <div>
                            <p className="text-sm text-muted-foreground">Dátum úmrtia</p>
                            <p className="font-medium">
                                {new Date(athlete.death_date).toLocaleDateString("sk-SK")}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Miesto úmrtia</p>
                            <p className="font-medium">
                                {athlete.death_place}
                                {athlete.death_country ? `, ${athlete.death_country}` : ""}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>


        <Separator />


        {/* Olympic records table */}
        <Card>
            <CardHeader>
                <CardTitle>Olympijské záznamy</CardTitle>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rok</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Mesto</TableHead>
                            <TableHead>Krajina</TableHead>
                            <TableHead>Disciplína</TableHead>
                            <TableHead>Umiestnenie</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {athlete.records.map((record, index) => (
                            <TableRow key={index}>
                                <TableCell>{record.year}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{record.type}</Badge>
                                </TableCell>
                                <TableCell>{record.city}</TableCell>
                                <TableCell>{record.host_country}</TableCell>
                                <TableCell>{record.discipline}</TableCell>
                                <TableCell>
                                    <Badge variant={placingVariant(record.placing)}>
                                        {placingLabel(record.placing)}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        
    </div>
  );
}
