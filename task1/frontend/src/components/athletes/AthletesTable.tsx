import { Link, useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Skeleton } from "../ui/skeleton";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

// main data table using shadcn + tanstack

interface Athlete {
  id: number;
  name: string;
  surname: string;
}

interface AthleteTableProps {
  data: Athlete[];
  loading: boolean;
  sort: string;
  order: "ASC" | "DESC";
  onSort: (column: string) => void;
}


export function AthletesTable({ data, loading, sort, order, onSort }: AthleteTableProps) {
    const navigate = useNavigate();

    // sort indicator icon
    const SortIcon = ({column }: {column: string}) => {
        if (sort!== column) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
        if (order === "ASC") return <ArrowUp className="ml-1 h-4 w-4 inline" />;
        if (order === "DESC") return <ArrowDown className="ml-1 h-4 w-4 inline" />;
    };

    const SortableHead = ({column, label}: {column: string, label: string}) => (
        <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => onSort(column)}>
            {label}
            <SortIcon column={column} />
        </TableHead>
    );


    const handleClickRow = (id: number) => {
        navigate(`/athlete/${id}`);
    }



    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({length: 5}).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Žiadne záznamy na zobrazenie.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Meno</TableHead>

                        {/* "Priezvisko" — sortable */}
                        <SortableHead column="surname" label="Priezvisko" />
                    </TableRow>
                </TableHeader>


                <TableBody>

                    {data.map((athlete, index) => (
                        <TableRow key={`${athlete.id}-${index}`} onClick={() => handleClickRow(athlete.id)} className="hover:cursor-pointer">

                            {/* Clickable name → detail page */}
                            <TableCell>
                                <Link
                                    to={`/athlete/${athlete.id}`}
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    {athlete.name}
                                </Link>
                            </TableCell>

                            <TableCell>{athlete.surname}</TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </div>
    );
}