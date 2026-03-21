import { useState, useEffect } from "react";
import { AthletesTable } from "@/components/athletes/AthletesTable";
import { AthleteFilters } from "@/components/athletes/AthleteFilters";
import { useAthletes } from "@/hooks/useAthletes";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


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
    // filters state
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);

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

    const 



    return (
        <div className="space-y-6">

            <div className="justify-center flex">
                <ToggleGroup variant="outline" type="single" size="lg" defaultValue="athletes">
                    <ToggleGroupItem value="athletes" aria-label="Toggle athletes">
                        Športovci
                    </ToggleGroupItem>
                    <ToggleGroupItem value="records" aria-label="Toggle records">
                        Umiestnenia
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <h1 className="text-3xl font-bold">Prehľad slovenských olympionikov</h1>

            {/* Filters */}
            <AthleteFilters
                years={years}
                disciplines={disciplines}
                selectedYear={selectedYear}
                selectedDiscipline={selectedDiscipline}
                onYearChange={handleYearChange}
                onDisciplineChange={handleDisciplineChange}
            />

            {/* Table */}
            <AthletesTable
                data={athletesData}
                loading={loading}
                sort={sort}
                order={order}
                onSort={handleSort}
            />

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