import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { NewOlympicsForm } from "@/components/import/NewOlympicsForm";
import { NewDisciplineForm } from "@/components/import/NewDisciplineForm";
import { ArrowLeft, Pencil, Trash, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

// detail page for a single athlete, shows all data from provided file

// GET /api/athletes/:id


interface AthleteRecord {
    athlete_record_id: number;
    olympics_id: number;
    discipline_id: number;
    year: number;
    type: string;
    city: string;
    host_country: string;
    discipline: string;
    placing: number;
}

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
    records: AthleteRecord[];
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

export function AthleteDetailPage() {
    const {id} = useParams<{id: string}>();
    const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { isLoggedIn } = useAuth();

    // Personal info edit state
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "", surname: "", birth_day: "", birth_place: "", birth_country: "",
        death_day: "" as string, death_place: "", death_country: "",
    });
    const [saving, setSaving] = useState(false);

    // Records selection
    const [selected, setSelected] = useState<number[]>([]);

    // Record edit modal
    const [editingRecord, setEditingRecord] = useState<AthleteRecord | null>(null);
    const [modalOlympics, setModalOlympics] = useState<Olympics[]>([]);
    const [modalDisciplines, setModalDisciplines] = useState<Discipline[]>([]);
    const [selectedOlympics, setSelectedOlympics] = useState<Olympics | null>(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
    const [modalPlacing, setModalPlacing] = useState("");
    const [olympicsQuery, setOlympicsQuery] = useState("");
    const [disciplineQuery, setDisciplineQuery] = useState("");
    const [openOlympics, setOpenOlympics] = useState(false);
    const [openDiscipline, setOpenDiscipline] = useState(false);
    const [olympicsMode, setOlympicsMode] = useState<"search" | "create">("search");
    const [disciplineMode, setDisciplineMode] = useState<"search" | "create">("search");
    const [modalSubmitting, setModalSubmitting] = useState(false);

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

    useEffect(() => {
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

                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Späť na zoznam
                </Button>
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

    // Personal info edit handlers
    const startEditing = () => {
        setEditForm({
            name: athlete.name,
            surname: athlete.surname,
            birth_day: athlete.birth_date,
            birth_place: athlete.birth_place,
            birth_country: athlete.birth_country,
            death_day: athlete.death_date || "",
            death_place: athlete.death_place || "",
            death_country: athlete.death_country || "",
        });
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
    };

    const savePersonalInfo = async () => {
        setSaving(true);
        try {
            await api.put(`/athletes/${id}`, {
                name: editForm.name,
                surname: editForm.surname,
                birth_day: editForm.birth_day,
                birth_place: editForm.birth_place,
                birth_country: editForm.birth_country,
                death_day: editForm.death_day || null,
                death_place: editForm.death_place || null,
                death_country: editForm.death_country || null,
            });
            toast.success("Údaje boli úspešne aktualizované.");
            setEditing(false);
            await fetchAthlete();
        } catch {
            toast.error("Chyba pri aktualizácii údajov.");
        } finally {
            setSaving(false);
        }
    };

    // Records selection handlers
    const handleClickSelect = (recordId: number) => {
        setSelected(prev => prev.includes(recordId) ? prev.filter(i => i !== recordId) : [...prev, recordId]);
    };

    const selectAll = athlete.records.length > 0 && athlete.records.length === selected.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(athlete.records.map(r => r.athlete_record_id));
        } else {
            setSelected([]);
        }
    };

    const handleDeleteSelected = async () => {
        try {
            await Promise.all(selected.map(rid => api.delete(`/athletes/records/${rid}`)));
            toast.success("Záznamy boli úspešne odstránené.");
            setSelected([]);
            await fetchAthlete();
        } catch {
            toast.error("Chyba pri odstraňovaní záznamov.");
        }
    };

    const handleDownloadSelected = () => {
        const selectedRecords = athlete.records.filter(r => selected.includes(r.athlete_record_id));
        const downloadData = {
            athlete: {
                name: athlete.name,
                surname: athlete.surname,
                birth_date: athlete.birth_date,
                birth_place: athlete.birth_place,
                birth_country: athlete.birth_country,
                death_date: athlete.death_date,
                death_place: athlete.death_place,
                death_country: athlete.death_country,
            },
            records: selectedRecords,
        };
        const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${athlete.name}_${athlete.surname}_records.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Úspešne stiahnuté údaje.");
    };

    // Record edit modal handlers
    const openEditModal = async (record: AthleteRecord) => {
        setEditingRecord(record);
        setModalPlacing(String(record.placing));
        setOlympicsMode("search");
        setDisciplineMode("search");
        setOlympicsQuery("");
        setDisciplineQuery("");

        try {
            const [olympicsRes, disciplinesRes] = await Promise.all([
                api.get("/olympics"),
                api.get("/disciplines"),
            ]);
            const olympicsList: Olympics[] = Array.isArray(olympicsRes.data) ? olympicsRes.data : [];
            const disciplinesList: Discipline[] = Array.isArray(disciplinesRes.data) ? disciplinesRes.data : [];
            setModalOlympics(olympicsList);
            setModalDisciplines(disciplinesList);

            setSelectedOlympics(olympicsList.find(o => o.id === record.olympics_id) || null);
            setSelectedDiscipline(disciplinesList.find(d => d.id === record.discipline_id) || null);
        } catch {
            setModalOlympics([]);
            setModalDisciplines([]);
            setSelectedOlympics(null);
            setSelectedDiscipline(null);
        }
    };

    const closeEditModal = () => {
        setEditingRecord(null);
        setSelectedOlympics(null);
        setSelectedDiscipline(null);
        setModalPlacing("");
    };

    const handleModalSubmit = async () => {
        if (!editingRecord || !selectedOlympics || !selectedDiscipline || !modalPlacing) return;
        setModalSubmitting(true);
        try {
            await api.put(`/athletes/records/${editingRecord.athlete_record_id}`, {
                olympics_id: selectedOlympics.id,
                discipline_id: selectedDiscipline.id,
                placing: parseInt(modalPlacing),
            });
            toast.success("Záznam bol úspešne aktualizovaný.");
            closeEditModal();
            await fetchAthlete();
        } catch {
            toast.error("Chyba pri aktualizácii záznamu.");
        } finally {
            setModalSubmitting(false);
        }
    };

    const filteredOlympics = modalOlympics.filter(o => {
        const q = olympicsQuery.toLowerCase();
        return `${o.host_country} ${o.year} ${o.city} ${o.type}`.toLowerCase().includes(q);
    });

    const filteredDisciplines = modalDisciplines.filter(d => {
        const q = disciplineQuery.toLowerCase();
        return d.name.toLowerCase().includes(q);
    });


    const deleteAthlete = async () => {
        try {
            await api.delete(`/athlete/${id}`);
            toast.success("Atlét bol úspešne odstránený");
            navigate(-1);

        } catch {
            toast.error("Chyba pri vymazávaní záznamu.");
        }
    }


  return (
    <div className="space-y-6">

        <div className="flex mr-6 ml-2">
            {/* Back navigation */}
            <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                Späť na zoznam
            </Button>

            {isLoggedIn && (<Button variant="destructive" className="ml-auto" onClick={() => deleteAthlete()}>Vymazať atléta<Trash /></Button>)}
        </div>


        {/* Personal info card */}
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">

                        {editing ? (
                            <div className="flex gap-5">
                                <div>
                                    <Label htmlFor="name" className="text-sm text-muted-foreground">Meno</Label>
                                    <Input value={editForm.name} id="name" onChange={e => setEditForm(f => ({...f, name: e.target.value}))} placeholder="Meno" />
                                </div>
                                <div>
                                    <Label htmlFor="surname" className="text-sm text-muted-foreground">Priezvisko</Label>
                                    <Input value={editForm.surname} id="surname" onChange={e => setEditForm(f => ({...f, surname: e.target.value}))} placeholder="Priezvisko" />
                                </div>
                            </div>

                        ) : (
                            <>{athlete.name} {athlete.surname}</>
                        )}

                    </CardTitle>

                    {isLoggedIn && !editing && (
                        <Button variant="ghost" size="sm" onClick={startEditing}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}

                </div>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-5">

                {editing ? (
                    <>

                        <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">Dátum narodenia</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start font-normal"
                                    >
                                        {editForm.birth_day ? format(new Date(editForm.birth_day), "d.M.yyyy") : "Vybrať dátum"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={editForm.birth_day ? new Date(editForm.birth_day) : undefined}
                                        onSelect={(date) => setEditForm(f => ({ ...f, birth_day: date ? format(date, "yyyy-MM-dd") : "" }))}
                                        captionLayout="dropdown"
                                        defaultMonth={editForm.birth_day ? new Date(editForm.birth_day) : undefined}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <Label className="text-sm text-muted-foreground">Miesto narodenia</Label>
                            <Input value={editForm.birth_place} onChange={e => setEditForm(f => ({...f, birth_place: e.target.value}))} placeholder="Miesto" />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <Label className="text-sm text-muted-foreground">Krajina narodenia</Label>
                            <Input value={editForm.birth_country} onChange={e => setEditForm(f => ({...f, birth_country: e.target.value}))} placeholder="Krajina" />
                        </div>




                        <div className="sm:col-span-5">
                            <Separator className="my-2" />
                            <p className="text-sm font-medium mt-6">Údaje o úmrtí <span className="opacity-60">(voliteľné)</span></p>
                        </div>


                        <div className="space-y-1 ">
                            <Label className="text-sm text-muted-foreground">Dátum úmrtia</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start font-normal"
                                    >
                                        {editForm.death_day ? format(new Date(editForm.death_day), "d.M.yyyy") : <span className="opacity-60">Vybrať dátum</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={editForm.death_day ? new Date(editForm.death_day) : undefined}
                                        onSelect={(date) => setEditForm(f => ({ ...f, death_day: date ? format(date, "yyyy-MM-dd") : "" }))}
                                        captionLayout="dropdown"
                                        defaultMonth={editForm.death_day ? new Date(editForm.death_day) : undefined}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <Label className="text-sm text-muted-foreground">Miesto úmrtia</Label>
                            <Input value={editForm.death_place} onChange={e => setEditForm(f => ({...f, death_place: e.target.value}))} placeholder="Miesto" />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <Label className="text-sm text-muted-foreground">Krajina úmrtia</Label>
                            <Input value={editForm.death_country} onChange={e => setEditForm(f => ({...f, death_country: e.target.value}))} placeholder="Krajina" />
                        </div>



                        <div className="sm:col-span-5 flex gap-2 justify-end mt-2">
                            <Button variant="outline" onClick={cancelEditing} disabled={saving}>Zrušiť</Button>
                            <Button onClick={savePersonalInfo} disabled={saving}>
                                {saving ? "Ukladanie..." : "Uložiť"}
                            </Button>
                        </div>

                    </>



                /* not editing state */
                ) : (
                    <>
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
                    </>
                )}
            </CardContent>
        </Card>




        <Separator />




        {/* Olympic records table */}
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Olympijské záznamy</CardTitle>
                
                    {isLoggedIn && (
                        <div className="flex items-center gap-2 pt-2">
                            <Button className="ml-auto" variant="ghost" size="sm" onClick={handleDownloadSelected} disabled={selected.length === 0}>
                                <Download />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={selected.length === 0}>
                                <Trash />
                            </Button>
                            <Button size="sm" onClick={() => navigate("/athlete/record/new")}>
                                <Plus className="h-4 w-4 mr-1" /> Nový Záznam
                            </Button>
                        </div>
                )}
                </div>
            </CardHeader>


            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isLoggedIn && (
                                <TableHead>
                                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                </TableHead>
                            )}
                            <TableHead>Rok</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Mesto</TableHead>
                            <TableHead>Krajina</TableHead>
                            <TableHead>Disciplína</TableHead>
                            <TableHead>Umiestnenie</TableHead>
                            {isLoggedIn && <TableHead></TableHead>}
                        </TableRow>
                    </TableHeader>


                    <TableBody>
                        {athlete.records.map((record) => (
                            <TableRow key={record.athlete_record_id} className="rounded-xl">
                                {isLoggedIn && (
                                    <TableCell>
                                        <Checkbox
                                            checked={selected.includes(record.athlete_record_id)}
                                            onCheckedChange={() => handleClickSelect(record.athlete_record_id)}
                                        />
                                    </TableCell>
                                )}
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

                                {isLoggedIn && (
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(record)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                )}

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>


        

        {/* Record Edit Modal */}
        <Dialog open={editingRecord !== null} onOpenChange={(open) => { if (!open) closeEditModal(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upraviť záznam</DialogTitle>
                    <DialogDescription>Zmeňte olympiádu, disciplínu alebo umiestnenie.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Olympics selection */}
                    <div className="space-y-2">

                        <div className="flex">
                            <Label className="font-semibold">Olympiáda</Label>
                            {!selectedOlympics && olympicsMode!=="search" && (<Button className="ml-auto" type="button" variant="destructive" size="sm" onClick={() => setOlympicsMode("search")}>Zrušiť</Button>)}
                        </div>

                        {selectedOlympics ? (
                            <div className="flex items-center justify-between rounded-lg border p-2">
                                <span>{selectedOlympics.host_country} {selectedOlympics.year} — {selectedOlympics.city} ({selectedOlympics.type})</span>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedOlympics(null); setOlympicsMode("search"); setOlympicsQuery(""); }}>
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

                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={e => e.preventDefault()}>
                                        <Command shouldFilter={false}>
                                            <CommandList className="max-h-100 overflow-y-auto">

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
                                    + Nová
                                </Button>

                            </div>

                        /* creating new */
                        ) : (
                            <div className="space-y-2 bg-[#0b0b0b08] rounded-lg p-4">
                                <NewOlympicsForm onCreated={(olympics) => {
                                    setSelectedOlympics(olympics);
                                    setOlympicsMode("search");
                                    api.get("/olympics").then(res => setModalOlympics(Array.isArray(res.data) ? res.data : [])).catch(() => {});
                                }} />

                                <div className="h-4"></div>
                            </div>
                        )}
                    </div>


                    <div className="h-1"></div>



                    {/* Discipline selection */}
                    <div className="space-y-2">
                        
                        <div className="flex">
                            <Label className="font-semibold">Disciplína</Label>
                            {!selectedDiscipline && disciplineMode!=="search" && (<Button type="button" variant="destructive" size="sm" onClick={() => setDisciplineMode("search")} className="ml-auto">Zrušiť</Button>)}
                        </div>

                        {selectedDiscipline ? (
                            <div className="flex items-center justify-between rounded-lg border p-2">
                                <span>{selectedDiscipline.name}</span>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedDiscipline(null); setDisciplineMode("search"); setDisciplineQuery(""); }}>
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

                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={e => e.preventDefault()}>
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
                                    + Nová
                                </Button>

                            </div>

                        ) : (
                            <div className="space-y-2 bg-[#0b0b0b08] rounded-lg p-4">
                                <NewDisciplineForm onCreated={(discipline) => {
                                    setSelectedDiscipline(discipline);
                                    setDisciplineMode("search");
                                    api.get("/disciplines").then(res => setModalDisciplines(Array.isArray(res.data) ? res.data : [])).catch(() => {});
                                }} />
                                <div className="h-4"></div>
                            </div>
                        )}
                    </div>


                    <div className="h-1"></div>


                    {/* Placing */}
                    <div className="space-y-2">
                        <Label htmlFor="modal-placing">Umiestnenie</Label>
                        <Input
                            id="modal-placing"
                            type="number"
                            min={1}
                            value={modalPlacing}
                            onChange={e => setModalPlacing(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full"
                        disabled={modalSubmitting || !selectedOlympics || !selectedDiscipline || !modalPlacing}
                        onClick={handleModalSubmit}
                    >
                        {modalSubmitting ? "Ukladanie..." : "Uložiť zmeny"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>


    </div>
  );
}
