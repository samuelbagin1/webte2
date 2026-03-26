import { AthletesTable } from "@/components/tables/AthletesTable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RecordsTable } from "@/components/tables/RecordsTable";
import { useSearchParams } from "react-router-dom";
import { OlympicsTable } from "@/components/tables/OlympicsTable";
import { DisciplinesTable } from "@/components/tables/DisciplinesTable";


export function EditPage() {
    // athletes/records select — persisted in URL so browser back restores it
    const [searchParams, setSearchParams] = useSearchParams();
    const validViews = ["athletes", "records", "olympics", "disciplines"] as const;
    const rawView = searchParams.get("view");
    
    const view = validViews.includes(rawView as typeof validViews[number]) ? rawView! : "athletes";
    const setView = (val: string) => setSearchParams({ view: val }, { replace: true });

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
                    <ToggleGroupItem value="olympics" aria-label="Toggle records">
                        Olympiády
                    </ToggleGroupItem>
                    <ToggleGroupItem value="disciplines" aria-label="Toggle records">
                        Disciplíny
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {view === "records" && <RecordsTable />}
            {view === "athletes" && <AthletesTable />}
            {view === "olympics" && <OlympicsTable />}
            {view === "disciplines" && <DisciplinesTable />}
        </div>
    );
}
