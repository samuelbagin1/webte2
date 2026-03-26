import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import api from "@/api/client";
import { Skeleton } from "../ui/skeleton";
import { ArrowUp, ArrowDown, ArrowUpDown, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Trash, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useOnlyAthletes } from "@/hooks/useOnlyAthletes";

// in edit page

export function AthletesTable() {
    const navigate = useNavigate();

    const [selected, setSelected] = useState<number[]>([]);

    // sorting
    const [sort, setSort] = useState<string>("");
    const [order, setOrder] = useState<"ASC" | "DESC">("ASC");

    // pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data, total, loading, refetch } = useOnlyAthletes({ page, limit, sort, order });

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    const handleSort = (column: string) => {
        if (sort !== column) {
            setSort(column);
            setOrder("ASC");
        } else if (order === "ASC") {
            setOrder("DESC");
        } else if (order === "DESC") {
            setOrder("ASC");
        }
        setPage(1);
    };

    // sort indicator icon
    const SortIcon = ({column }: {column: string}) => {
        if (sort!== column) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
        if (order === "ASC") return <ArrowUp className="ml-1 h-4 w-4 inline" />;
        if (order === "DESC") return <ArrowDown className="ml-1 h-4 w-4 inline" />;
    };

    const SortableHead = ({column, label}: {column: string, label: string}) => (
        <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => handleSort(column)}>
            {label}
            <SortIcon column={column} />
        </TableHead>
    );


    const handleClickRow = (id: number) => {
        navigate(`/athlete/${id}`);
    }

    const handleClickSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((i) => i!==id) : [...prev, id]);
    }

    const selectAll = data.length > 0 && data.length === selected.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(data.map((athlete) => athlete.id))
        } else {
            setSelected([])
        }
    }


    const handleDelete = async () => {
        await Promise.all(selected.map((id) => api.delete(`/athletes/${id}`)));
        toast.success("Úspešne odstraný");
        setSelected([]);
        refetch();
    }

    const handleDownload = () => {
        const selectedAthletes = data.filter((a) => selected.includes(a.id));
        const blob = new Blob([JSON.stringify(selectedAthletes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "athletes.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Úspešne stiahnuté údaje");
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
        <div className="space-y-4">
            <div className="flex w-[85%] space-x-3">
                <h1 className="text-3xl font-bold">Prehľad slovenských olympionikov</h1>
                <Button className="ml-auto" variant="ghost" onClick={() => handleDownload()} disabled={selected.length === 0}><Download /></Button>
                <Button variant="destructive" onClick={() => handleDelete()} disabled={selected.length === 0}><Trash /></Button>
                <Button onClick={() => navigate("/athlete/new")}><Plus />Nový atlét</Button>
            </div>

            <div className="rounded-md border w-[70%] mx-auto mt-4">

                <Table>
                    <TableHeader>
                        <TableRow>

                            <TableHead>
                                <Checkbox
                                    id="select-all-checkbox"
                                    name="select-all-checkbox"
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>

                            <TableHead>Meno</TableHead>

                            {/* "Priezvisko" — sortable */}
                            <SortableHead column="surname" label="Priezvisko" />
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>


                    <TableBody>

                        {data.map((athlete, index) => (
                            <TableRow key={`${athlete.id}-${index}`} onClick={() => handleClickSelect(athlete.id)} className="hover:cursor-pointer">

                                <TableCell><Checkbox checked={selected.includes(athlete.id)} onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickSelect(athlete.id);
                                    }} />
                                </TableCell>

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
                                <TableCell><Button onClick={() => handleClickRow(athlete.id)} size="xs" className="cursor-pointer" variant="outline"><ArrowRight /></Button></TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Záznamov na stránku:</span>
                    {[10, 20, 0].map((l) => (
                        <Button
                            key={l}
                            variant={limit === l ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setLimit(l); setPage(1); }}
                        >
                            {l === 0 ? "Všetky" : l}
                        </Button>
                    ))}
                </div>

                {limit > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="xs"
                            disabled={page <= 1}
                            onClick={() => setPage(1)}
                        >
                            Prvá
                        </Button>

                        <Button
                            variant="outline"
                            size="xs"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft />
                        </Button>

                        <span className="text-sm">
                            Strana {page} z {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="xs"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronRight />
                        </Button>

                        <Button
                            variant="outline"
                            size="xs"
                            disabled={page >= totalPages}
                            onClick={() => setPage(totalPages)}
                        >
                            Posledná
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
