import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AthleteFilters } from "@/components/tables/AthleteFilters";
import api from "@/api/client";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { ArrowUp, ArrowDown, ArrowUpDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Trash, Download } from "lucide-react";
import { toast } from "sonner";
import { useAthletes } from "@/hooks/useAthletes";

interface FilterOption {
    id: number;
    name: string;
}


export function RecordsTable() {
    const navigate = useNavigate();

    const [selected, setSelected] = useState<number[]>([]);

    // sorting
    const [sort, setSort] = useState<string>("");
    const [order, setOrder] = useState<"ASC" | "DESC">("ASC");

    // pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // filter options
    const [years, setYears] = useState<number[]>([]);
    const [disciplines, setDisciplines] = useState<FilterOption[]>([]);

    // filter state
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedPlacing, setSelectedPlacing] = useState<number | null>(null);

    // fetch filter options on mount
    useEffect(() => {
        api.get("/filters/years").then((res) => setYears(res.data));
        api.get("/filters/disciplines").then((res) => setDisciplines(res.data));
    }, []);

    const { data, total, loading, refetch } = useAthletes({ page, limit, sort, order, year: selectedYear, discipline: selectedDiscipline, type: selectedType, placing: selectedPlacing });

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hideYear = selectedYear !== null;
    const hideDiscipline = selectedDiscipline !== null;

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

    const placingLabel = (placing: number) => {
        switch (placing) {
            case 1: return "Zlato";
            case 2: return "Striebro";
            case 3: return "Bronz";
            default: return `${placing}. miesto`;
        };
    }

    const handleClickRow = (id: number) => {
        navigate(`/athlete/${id}`);
    }

    const handleClickSelect = (id: number) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((i) => i!==id) : [...prev, id]);
    }

    const selectAll = data.length > 0 && data.length === selected.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(data.map((athlete) => athlete.athlete_record_id))
        } else {
            setSelected([])
        }
    }

    const handleDelete = async () => {
        await Promise.all(selected.map((id) => api.delete(`/athletes/records/${id}`)));
        toast.success("Úspešne odstraný");
        setSelected([]);
        refetch();
    }

    const handleDownload = () => {
        const selectedRecords = data.filter((a) => selected.includes(a.athlete_record_id));
        const blob = new Blob([JSON.stringify(selectedRecords, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "records.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Úspešne stiahnuté údaje");
    }

    const handleYearChange = (year: number | null) => {
        setSelectedYear(year);
        setPage(1);
    }

    const handleDisciplineChange = (discipline: string | null) => {
        setSelectedDiscipline(discipline);
        setPage(1);
    }

    const handleTypeChange = (type: string | null) => {
        setSelectedType(type);
        setPage(1);
    }

    const handlePlacingChange = (placing: number | null) => {
        setSelectedPlacing(placing);
        setPage(1);
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
            <h1 className="text-3xl font-bold">Prehľad záznamov olympionikov</h1>

            <div className="flex items-center space-x-3">
                <AthleteFilters
                    years={years}
                    disciplines={disciplines}
                    selectedYear={selectedYear}
                    selectedDiscipline={selectedDiscipline}
                    selectedType={selectedType}
                    selectedPlacing={selectedPlacing}
                    onYearChange={handleYearChange}
                    onDisciplineChange={handleDisciplineChange}
                    onTypeChange={handleTypeChange}
                    onPlacingChange={handlePlacingChange}
                />
                <Button className="ml-auto" variant="ghost" onClick={() => handleDownload()} disabled={selected.length === 0}><Download /></Button>
                <Button variant="destructive" onClick={() => handleDelete()} disabled={selected.length === 0}><Trash /></Button>
                <Button onClick={() => navigate("/athlete/record/new")}><Plus />Nový záznam</Button>
            </div>

            <div className="rounded-md border">
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

                            <SortableHead column="surname" label="Priezvisko" />

                            {!hideYear && <SortableHead column="year" label="Rok Narodenia" />}

                            <TableHead>Typ</TableHead>

                            <TableHead>Krajina</TableHead>

                            {!hideDiscipline && <SortableHead column="discipline" label="Kategória" />}

                            <TableHead>Umiestnenie</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((athlete, index) => (
                            <TableRow key={`${athlete.id}-${index}`} onClick={() => handleClickSelect(athlete.athlete_record_id)} className="hover:cursor-pointer">

                                <TableCell><Checkbox checked={selected.includes(athlete.athlete_record_id)} onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickSelect(athlete.athlete_record_id);
                                    }} />
                                </TableCell>

                                <TableCell>
                                    <Link
                                        to={`/athlete/${athlete.id}`}
                                        className="font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        {athlete.name}
                                    </Link>
                                </TableCell>

                                <TableCell>{athlete.surname}</TableCell>

                                {!hideYear && <TableCell>{athlete.year}</TableCell>}

                                <TableCell>
                                    <Badge variant="outline">{athlete.type}</Badge>
                                </TableCell>

                                <TableCell>{athlete.country}</TableCell>

                                {!hideDiscipline && <TableCell>{athlete.discipline}</TableCell>}

                                <TableCell>
                                    <Badge variant={athlete.placing <= 3 ? "default" : "secondary"}>
                                        {placingLabel(athlete.placing)}
                                    </Badge>
                                </TableCell>

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
