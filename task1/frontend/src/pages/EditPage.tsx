import { useState, useEffect } from "react";
import { AthletesTable } from "@/components/athletes/AthletesTable";
import { AthleteFilters } from "@/components/athletes/AthleteFilters";
import { useAthletes } from "@/hooks/useAthletes";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RecordsTable } from "@/components/athletes/RecordsTable";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";


// public page
// athletes table with year/discipline dropdown filters, 3-state column sorting (ASC -> DESC -> ASC)

interface FilterOption {
    id: number;
    name: string;
}

interface Athlete {
  id: number;
  name: string;
  surname: string;
}


export function EditPage() {
    const navigate = useNavigate();

    // filters state
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);

    // athletes/records select
    const [view, setView] = useState("athletes");

    // sorting and ordering
    const [sort, setSort] = useState<string>("");
    const [order, setOrder] = useState<"ASC" | "DESC">("ASC");

    // pagination and limit for rows/page
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // filter options
    const [years, setYears] = useState<number[]>([]);
    const [disciplines, setDisciplines] = useState<FilterOption[]>([]);



    // fetch filter options on mount
    useEffect(() => {
        api.get("/filters/years").then((res) => setYears(res.data));
        api.get("/filters/disciplines").then((res) => setDisciplines(res.data));
    }, []);

    // fetch athletes with current params - server-side
    const { data, total, loading } = useAthletes({page, limit, sort, order, year: selectedYear, discipline:  selectedDiscipline});

    const athletesData: Athlete[] = Array.from(
        new Map(data.map((r) => [r.id, { id: r.id, name: r.name, surname: r.surname }])).values()
    );

    const handleSort = (column: string) => {

        // new column
        if (sort!==column) {
            setSort(column);
            setOrder("ASC");

        } else if (order === "ASC") {
            setOrder("DESC");
        } else if (order === "DESC") {
            setOrder("ASC");
        }

        setPage(1);
    };

    const handleYearChange = (year: number | null) => {
        setSelectedYear(year);
        setPage(1);
    }

    const handleDisciplineChange = (discipline: number | null) => {
        setSelectedDiscipline(discipline);
        setPage(1);
    }

    const totalPages = limit>0 ? Math.ceil(total / limit) : 1;



    return (
        <div className="space-y-6">

            <div className="justify-center flex">
                <ToggleGroup defaultValue="athletes" variant="outline" type="single" size="lg" onValueChange={(val) => {if (val) setView(val);}}>
                    <ToggleGroupItem value="athletes" aria-label="Toggle athletes">
                        Športovci
                    </ToggleGroupItem>
                    <ToggleGroupItem value="records" aria-label="Toggle records">
                        Umiestnenia
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            

            {/* Filters */}
            {view === "records" ? (
                <div>
                    <h1 className="text-3xl font-bold">Prehľad záznamov olympionikov</h1>
                    <div className="h-4"></div>
                    <div className="flex">
                        <AthleteFilters
                            years={years}
                            disciplines={disciplines}
                            selectedYear={selectedYear}
                            selectedDiscipline={selectedDiscipline}
                            onYearChange={handleYearChange}
                            onDisciplineChange={handleDisciplineChange}
                        />

                        <Button className="ml-auto" onClick={() => navigate("/athlete/record/new")}><Plus />Nový záznam</Button>
                    </div>
                </div>
            ) : (
                <div className="flex w-[85%]">
                    <h1 className="text-3xl font-bold">Prehľad slovenských olympionikov</h1>
                    <Button className="ml-auto" onClick={() => navigate("/athlete/new")}><Plus />Nový atlét</Button>
                </div>
            )}

            {view === "records" && (<RecordsTable
                data={data}
                loading={loading}
                sort={sort}
                order={order}
                onSort={handleSort}
                hideYear={selectedYear !== null}
                hideDiscipline={selectedDiscipline !== null}
            />)}

            {/* Table */}
            {view === "athletes" && (<AthletesTable
                data={athletesData}
                loading={loading}
                sort={sort}
                order={order}
                onSort={handleSort}
            />)}

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
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Predchádzajúca
                        </Button>

                        <span className="text-sm">
                            Strana {page} z {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Nasledujúca
                        </Button>
                    </div>
                )}
                
            </div>
        </div>
    );
}