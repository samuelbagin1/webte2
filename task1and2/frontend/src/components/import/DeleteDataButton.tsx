import { useState } from "react";
import api from "@/api/client";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger, DialogClose} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

// delete all olympic data from database

// DELETE /athletes

export function DeleteDataButton() {
    const [deleting, setDeleting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);

        try {
            await api.delete("/athletes");
            toast.success("Dáta boli úspešne vymazané");
            setOpen(false);

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri vymazávaní dát";
            toast.error(message);

        } finally {
            setDeleting(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Vymazať všetky dáta
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vymazať olympijské dáta?</DialogTitle>
                    <DialogDescription>
                        Táto akcia vymaže všetky záznamy olympionikov z databázy.
                        Po vymazaní je možné dáta znova importovať zo súboru.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Zrušiť</Button>
                    </DialogClose>

                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Mazanie..." : "Potvrdiť vymazanie"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}