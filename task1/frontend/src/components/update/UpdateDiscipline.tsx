import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";


const updateDisciplineSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Názov disciplíny je povinný údaj"),
});

type UpdateDisciplineFormValues = z.infer<typeof updateDisciplineSchema>;

interface UpdateDisciplineProps {
    data: UpdateDisciplineFormValues;
    onUpdated?: () => void;
}

export function UpdateDiscipline({ data, onUpdated }: UpdateDisciplineProps) {
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<UpdateDisciplineFormValues>({
        resolver: zodResolver(updateDisciplineSchema),
        mode: "onBlur",
        defaultValues: { id: data.id, name: data.name },
    });

    const onSubmit = async (values: UpdateDisciplineFormValues) => {
        setSubmitting(true);

        try {
            await api.put(`/disciplines/${data.id}`, values);
            toast.success("Disciplína bola úspešne aktualizovaná.");
            onUpdated?.();

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri updatovaní disciplíny";
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
                    {...register("name")}
                    aria-invalid={!!errors.name}
                />

                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>


            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Ukladanie..." : "Uložiť"}
            </Button>
        </form>
  );

}
