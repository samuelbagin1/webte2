import { AthletesTable } from "@/components/athletes/AthletesTable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RecordsTable } from "@/components/athletes/RecordsTable";
import { useSearchParams } from "react-router-dom";


export function EditPage() {
    // athletes/records select — persisted in URL so browser back restores it
    const [searchParams, setSearchParams] = useSearchParams();
    const view = searchParams.get("view") === "records" ? "records" : "athletes";
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
                </ToggleGroup>
            </div>

            {view === "records" && <RecordsTable />}
            {view === "athletes" && <AthletesTable />}
        </div>
    );
}
