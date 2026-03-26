import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/api/client";
import { Skeleton } from "../ui/skeleton";
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { NewDisciplineForm } from "@/components/import/NewDisciplineForm"
import { Trash, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { UpdateDiscipline } from "../update/UpdateDiscipline";

interface Discipline {
    id: number;
    name: string;
}

export function DisciplinesTable() {
    const [data, setData] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<number[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);

    // sorting
    const [sort, setSort] = useState<string>("name");
    const [order, setOrder] = useState<"ASC" | "DESC">("ASC");

    // pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/disciplines");
            setData(res.data);
        } catch {
            toast.error("Nepodarilo sa načítať disciplíny");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // client-side sorting
    const sorted = useMemo(() => {
        const copy = [...data];
        if (sort) {
            copy.sort((a, b) => {
                const valA = a[sort as keyof Discipline];
                const valB = b[sort as keyof Discipline];
                const cmp = typeof valA === "string" ? valA.localeCompare(valB as string) : (valA as number) - (valB as number);
                return order === "ASC" ? cmp : -cmp;
            });
        }
        return copy;
    }, [data, sort, order]);

    // client-side pagination
    const total = sorted.length;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const paged = limit > 0 ? sorted.slice((page - 1) * limit, page * limit) : sorted;

    const handleSort = (column: string) => {
        if (sort !== column) {
            setSort(column);
            setOrder("ASC");
        } else if (order === "ASC") {
            setOrder("DESC");
        } else {
            setOrder("ASC");
        }
        setPage(1);
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sort !== column) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
        if (order === "ASC") return <ArrowUp className="ml-1 h-4 w-4 inline" />;
        return <ArrowDown className="ml-1 h-4 w-4 inline" />;
    };

    const SortableHead = ({ column, label }: { column: string, label: string }) => (
        <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => handleSort(column)}>
            {label}
            <SortIcon column={column} />
        </TableHead>
    );

    const handleClickSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const selectAll = paged.length > 0 && paged.every((d) => selected.includes(d.id));

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(paged.map((d) => d.id));
        } else {
            setSelected([]);
        }
    };

    const handleDelete = async () => {
        try {
            await Promise.all(selected.map((id) => api.delete(`/disciplines/${id}`)));
            toast.success("Úspešne odstránené");
            setSelected([]);
            fetchData();
        } catch {
            toast.error("Chyba pri odstraňovaní");
        }
    };

    const handleDownload = () => {
        const selectedItems = data.filter((d) => selected.includes(d.id));
        const blob = new Blob([JSON.stringify(selectedItems, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "disciplines.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Úspešne stiahnuté údaje");
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Žiadne disciplíny na zobrazenie.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex w-[85%] space-x-3">
                <h1 className="text-3xl font-bold">Prehľad disciplín</h1>
                <Button className="ml-auto" variant="ghost" onClick={() => handleDownload()} disabled={selected.length === 0}><Download /></Button>
                <Button variant="destructive" onClick={() => handleDelete()} disabled={selected.length === 0}><Trash /></Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus /> Nová Discplína</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nová disciplína</DialogTitle>
                        </DialogHeader>
                        <NewDisciplineForm onCreated={() => {
                            setDialogOpen(false);
                            fetchData();
                        }} />
                    </DialogContent>
                </Dialog>
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
                            <SortableHead column="name" label="Názov" />
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paged.map((discipline) => (

                            <TableRow key={discipline.id} onClick={() => handleClickSelect(discipline.id)} className="hover:cursor-pointer">

                                <TableCell>
                                    <Checkbox checked={selected.includes(discipline.id)} onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickSelect(discipline.id);
                                    }} />
                                </TableCell>

                                <TableCell>{discipline.name}</TableCell>

                                <TableCell>
                                    <Dialog open={editingId === discipline.id} onOpenChange={(open) => setEditingId(open ? discipline.id : null)}>

                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="xs"><Pencil /></Button>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle>Upraviť disciplínu</DialogTitle>
                                            </DialogHeader>

                                            <UpdateDiscipline data={discipline} onUpdated={() => {
                                                setEditingId(null);
                                                fetchData();
                                            }} />

                                        </DialogContent>

                                    </Dialog>
                                </TableCell>
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
                        <Button variant="outline" size="xs" disabled={page <= 1} onClick={() => setPage(1)}>
                            Prvá
                        </Button>
                        <Button variant="outline" size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft />
                        </Button>
                        <span className="text-sm">
                            Strana {page} z {totalPages}
                        </span>
                        <Button variant="outline" size="xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                            <ChevronRight />
                        </Button>
                        <Button variant="outline" size="xs" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
                            Posledná
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
