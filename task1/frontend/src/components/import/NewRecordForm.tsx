import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Command, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { NewAthleteForm } from "./NewAthleteForm";
import { NewOlympicsForm } from "./NewOlympicsForm";
import { NewDisciplineForm } from "./NewDisciplineForm";

interface Athlete {
    id: number;
    name: string;
    surname: string;
}

interface Olympics {
    id: number;
    type: string;
    year: number;
    city: string;
    host_country: string;
}

interface Discipline {
    id: number;
    name: string;
}

export function NewRecordForm() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    // Selected entities
    const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
    const [selectedOlympics, setSelectedOlympics] = useState<Olympics | null>(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
    const [placing, setPlacing] = useState("");

    // Mode per step: search or create
    const [athleteMode, setAthleteMode] = useState<"search" | "create">("search");
    const [olympicsMode, setOlympicsMode] = useState<"search" | "create">("search");
    const [disciplineMode, setDisciplineMode] = useState<"search" | "create">("search");

    // Search queries
    const [athleteQuery, setAthleteQuery] = useState("");
    const [olympicsQuery, setOlympicsQuery] = useState("");
    const [disciplineQuery, setDisciplineQuery] = useState("");

    // Popover open state
    const [openAthlete, setOpenAthlete] = useState(false);
    const [openOlympics, setOpenOlympics] = useState(false);
    const [openDiscipline, setOpenDiscipline] = useState(false);

    // Data from API
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [olympics, setOlympics] = useState<Olympics[]>([]);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);

    // Fetch data on mount
    useEffect(() => {
        api.get("/athletes", { params: { page: 1, limit: 10000, sort: "surname", order: "ASC" } })
            .then(res => setAthletes(res.data.data))
            .catch(() => {});
        api.get("/olympics")
            .then(res => setOlympics(Array.isArray(res.data) ? res.data : []))
            .catch(() => {});
        api.get("/disciplines")
            .then(res => setDisciplines(Array.isArray(res.data) ? res.data : []))
            .catch(() => {});
    }, []);

    // Filtered results
    const filteredAthletes = athletes.filter(a => {
        const q = athleteQuery.toLowerCase();
        return `${a.name} ${a.surname}`.toLowerCase().includes(q);
    });

    const filteredOlympics = olympics.filter(o => {
        const q = olympicsQuery.toLowerCase();
        return `${o.host_country} ${o.year} ${o.city} ${o.type}`.toLowerCase().includes(q);
    });

    const filteredDisciplines = disciplines.filter(d => {
        const q = disciplineQuery.toLowerCase();
        return d.name.toLowerCase().includes(q);
    });

    // Submit
    const handleSubmit = async () => {
        if (!selectedAthlete || !selectedOlympics || !selectedDiscipline || !placing) return;

        setSubmitting(true);
        try {
            await api.post(`/athletes/${selectedAthlete.id}/records`, {
                year: selectedOlympics.year,
                type: selectedOlympics.type,
                city: selectedOlympics.city,
                olympics_country: selectedOlympics.host_country,
                discipline: selectedDiscipline.name,
                placing: parseInt(placing),
            });
            toast.success("Záznam bol úspešne vytvorený.");
            navigate("/edit");
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Chyba pri vytvorení záznamu";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Step 1: Athlete */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">1. Atlét</Label>

                {selectedAthlete ? (
                    <div className="flex items-center justify-between rounded-lg border p-2">
                        <span>{selectedAthlete.name} {selectedAthlete.surname}</span>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedAthlete(null); setSelectedOlympics(null); setSelectedDiscipline(null); setPlacing(""); setAthleteMode("search"); setAthleteQuery(""); }}>
                            Zmeniť
                        </Button>
                    </div>

                ) : athleteMode === "search" ? (
                    <div className="flex gap-2">
                        <Popover open={openAthlete && athleteQuery.length > 0} onOpenChange={setOpenAthlete}>

                            <PopoverAnchor asChild>
                                <Input
                                    className="flex-1"
                                    placeholder="Hľadať atléta (meno priezvisko)..."
                                    value={athleteQuery}
                                    onChange={e => { setAthleteQuery(e.target.value); setOpenAthlete(true); }}
                                    onFocus={() => { if (athleteQuery.length > 0) setOpenAthlete(true); }}
                                />
                            </PopoverAnchor>

                            <PopoverContent
                                className="w-[--radix-popover-trigger-width] p-0"
                                align="start"
                                onOpenAutoFocus={e => e.preventDefault()}
                            >
                                <Command shouldFilter={false}>
                                    <CommandList>
                                        <CommandEmpty className="px-3">Žiadne výsledky</CommandEmpty>

                                        {filteredAthletes.slice(0, 20).map(a => (
                                            <CommandItem
                                                key={a.id}
                                                value={`${a.name} ${a.surname}`}
                                                onSelect={() => { setSelectedAthlete(a); setOpenAthlete(false); setAthleteQuery(""); }}
                                            >
                                                {a.name} {a.surname}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>

                        </Popover>
                        <Button type="button" variant="outline" onClick={() => setAthleteMode("create")}>
                            + Nový Atlét
                        </Button>
                    </div>

                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setAthleteMode("search")}>
                                Zrušiť
                            </Button>
                        </div>
                        <NewAthleteForm onCreated={(athlete) => {
                            setSelectedAthlete(athlete);
                            setAthleteMode("search");
                            api.get("/athletes", { params: { page: 1, limit: 500, sort: "surname", order: "ASC" } })
                                .then(res => setAthletes(res.data.data)).catch(() => {});
                        }} />
                    </div>
                )}
            </div>



            {/* Step 2: Olympics (only if athlete selected) */}
            {selectedAthlete && (
                <div className="space-y-2">
                    <Label className="text-base font-semibold">2. Olympiáda</Label>

                    {selectedOlympics ? (
                        <div className="flex items-center justify-between rounded-lg border p-2">
                            <span>{selectedOlympics.host_country} {selectedOlympics.year} — {selectedOlympics.city} ({selectedOlympics.type})</span>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedOlympics(null); setSelectedDiscipline(null); setPlacing(""); setOlympicsMode("search"); setOlympicsQuery(""); }}>
                                Zmeniť
                            </Button>
                        </div>

                    ) : olympicsMode === "search" ? (
                        <div className="flex gap-2">
                            <Popover open={openOlympics && olympicsQuery.length > 0} onOpenChange={setOpenOlympics}>

                                <PopoverAnchor asChild>
                                    <Input
                                        className="flex-1"
                                        placeholder="Hľadať olympiádu (krajina rok)..."
                                        value={olympicsQuery}
                                        onChange={e => { setOlympicsQuery(e.target.value); setOpenOlympics(true); }}
                                        onFocus={() => { if (olympicsQuery.length > 0) setOpenOlympics(true); }}
                                    />
                                </PopoverAnchor>

                                <PopoverContent
                                    className="w-[--radix-popover-trigger-width] p-0"
                                    align="start"
                                    onOpenAutoFocus={e => e.preventDefault()}
                                >
                                    <Command shouldFilter={false}>
                                        <CommandList>
                                            <CommandEmpty className="px-3">Žiadne výsledky</CommandEmpty>

                                            {filteredOlympics.slice(0, 20).map(o => (
                                                <CommandItem
                                                    key={o.id}
                                                    value={`${o.host_country} ${o.year} ${o.city} ${o.type}`}
                                                    onSelect={() => { setSelectedOlympics(o); setOpenOlympics(false); setOlympicsQuery(""); }}
                                                >
                                                    {o.host_country} {o.year} — {o.city} ({o.type})
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>

                            </Popover>
                            <Button type="button" variant="outline" onClick={() => setOlympicsMode("create")}>
                                + Nová Olympiáda
                            </Button>
                        </div>

                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setOlympicsMode("search")}>
                                    Zrušiť
                                </Button>
                            </div>
                            <NewOlympicsForm onCreated={(olympics) => {
                                setSelectedOlympics(olympics);
                                setOlympicsMode("search");
                                api.get("/olympics").then(res => setOlympics(Array.isArray(res.data) ? res.data : [])).catch(() => {});
                            }} />
                        </div>
                    )}
                </div>
            )}



            {/* Step 3: Discipline (only if olympics selected) */}
            {selectedAthlete && selectedOlympics && (
                <div className="space-y-2">
                    <Label className="text-base font-semibold">3. Disciplína</Label>

                    {selectedDiscipline ? (
                        <div className="flex items-center justify-between rounded-lg border p-2">
                            <span>{selectedDiscipline.name}</span>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedDiscipline(null); setPlacing(""); setDisciplineMode("search"); setDisciplineQuery(""); }}>
                                Zmeniť
                            </Button>
                        </div>

                    ) : disciplineMode === "search" ? (
                        <div className="flex gap-2">
                            <Popover open={openDiscipline && disciplineQuery.length > 0} onOpenChange={setOpenDiscipline}>

                                <PopoverAnchor asChild>
                                    <Input
                                        className="flex-1"
                                        placeholder="Hľadať disciplínu..."
                                        value={disciplineQuery}
                                        onChange={e => { setDisciplineQuery(e.target.value); setOpenDiscipline(true); }}
                                        onFocus={() => { if (disciplineQuery.length > 0) setOpenDiscipline(true); }}
                                    />
                                </PopoverAnchor>

                                <PopoverContent
                                    className="w-[--radix-popover-trigger-width] p-0"
                                    align="start"
                                    onOpenAutoFocus={e => e.preventDefault()}
                                >
                                    <Command shouldFilter={false}>
                                        <CommandList>
                                            <CommandEmpty className="px-3">Žiadne výsledky</CommandEmpty>
                                            {filteredDisciplines.slice(0, 20).map(d => (
                                                <CommandItem
                                                    key={d.id}
                                                    value={d.name}
                                                    onSelect={() => { setSelectedDiscipline(d); setOpenDiscipline(false); setDisciplineQuery(""); }}
                                                >
                                                    {d.name}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>

                            </Popover>
                            <Button type="button" variant="outline" onClick={() => setDisciplineMode("create")}>
                                + Nová Disciplína
                            </Button>
                        </div>

                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setDisciplineMode("search")}>
                                    Zrušiť
                                </Button>
                            </div>
                            <NewDisciplineForm onCreated={(discipline) => {
                                setSelectedDiscipline(discipline);
                                setDisciplineMode("search");
                                api.get("/disciplines").then(res => setDisciplines(Array.isArray(res.data) ? res.data : [])).catch(() => {});
                            }} />
                        </div>
                    )}
                </div>
            )}



            {/* Step 4: Placing + Submit (only if all selected) */}
            {selectedAthlete && selectedOlympics && selectedDiscipline && (
                <div className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="placing">Umiestnenie</Label>
                        <Input
                            id="placing"
                            type="number"
                            min={1}
                            placeholder="1"
                            value={placing}
                            onChange={e => setPlacing(e.target.value)}
                        />
                    </div>

                    <Button
                        type="button"
                        className="w-full"
                        disabled={submitting || !placing}
                        onClick={handleSubmit}
                    >
                        {submitting ? "Vytváranie..." : "Vytvoriť záznam"}
                    </Button>

                </div>
            )}

        </div>
    );
}
