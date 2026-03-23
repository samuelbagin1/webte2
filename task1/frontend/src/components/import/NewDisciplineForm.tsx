import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";


const newDisciplineSchema = z.object({
    name: z.string().min(1, "Názov disciplíny je povinný údaj"),
});

type NewDisciplineFormValues = z.infer<typeof newDisciplineSchema>;




interface NewDisciplineFormProps {
    onCreated?: (discipline: { id: number; name: string }) => void;
}

export function NewDisciplineForm({ onCreated }: NewDisciplineFormProps = {}) {
     const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<NewDisciplineFormValues>({
        resolver: zodResolver(newDisciplineSchema),
        mode: "onBlur"
    });

    const onSubmit = async (values: NewDisciplineFormValues) => {
        setSubmitting(true);

        try {
            const { data: res } = await api.post("/disciplines", values);
            toast.success("Nová disciplina bola úspešne vytvorená.");
            if (onCreated) {
                onCreated({ id: res.id, name: res.name });
            } else {
                navigate("/edit");
            }

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri vytvorení novej discipliny";
            toast.error(message)

        } finally {
            setSubmitting(false);
        }
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


            {/* name */}
            <div className="space-y-2">
                <Label htmlFor="name">Názov</Label>
                <Input
                    id="name"
                    placeholder="Futbal"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                />

                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>


            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Vytváranie..." : "Vytvoriť"}
            </Button>
        </form>
  );
    
}