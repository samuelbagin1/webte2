import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"


const updateOlympicsSchema = z.object({
    id: z.number(),
    host_country: z.string().min(1, "Hosťujúca krajina je povinný údaj"),
    type: z.enum(["LOH", "ZOH"], { error: "Typ OH je povinný údaj" }),
    year: z.number().min(1, "Rok OH je povinný údaj"),
    city: z.string().min(1, "Mesto hosťujúce OH je povinný údaj"),
    code: z.string().min(1, "Skratka hosťujúcej krajiny je povinný údaj"),
});

type UpdateOlympicsFormValues = z.infer<typeof updateOlympicsSchema>;

interface UpdateOlympicsProps {
    data: UpdateOlympicsFormValues;
    onUpdated?: () => void;
}

export function UpdateOlympics({ data, onUpdated }: UpdateOlympicsProps) {
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<UpdateOlympicsFormValues>({
        resolver: zodResolver(updateOlympicsSchema),
        mode: "onBlur",
        defaultValues: {
            id: data.id,
            host_country: data.host_country,
            type: data.type,
            year: data.year,
            city: data.city,
            code: data.code,
        },
    });

    const onSubmit = async (values: UpdateOlympicsFormValues) => {
        setSubmitting(true);

        try {
            await api.put(`/olympics/${data.id}`, values);
            toast.success("Olympiáda bola úspešne aktualizovaná.");
            onUpdated?.();

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri updatovaní olympiády";
            toast.error(message)

        } finally {
            setSubmitting(false);
        }
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid gap-4 sm:grid-cols-2">
                {/* host_country */}
                <div className="space-y-2">
                    <Label htmlFor="host_country">Hosťujúca krajina</Label>
                    <Input
                        id="host_country"
                        {...register("host_country")}
                        aria-invalid={!!errors.host_country}
                    />

                    {errors.host_country && (
                        <p className="text-sm text-destructive">{errors.host_country.message}</p>
                    )}
                </div>

                {/* code */}
                <div className="space-y-2">
                    <Label htmlFor="code">Skratka krajiny</Label>
                    <Input
                        id="code"
                        {...register("code")}
                        aria-invalid={!!errors.code}
                    />

                    {errors.code && (
                        <p className="text-sm text-destructive">{errors.code.message}</p>
                    )}
                </div>
            </div>


            {/* city */}
            <div className="space-y-2">
                <Label htmlFor="city">Mesto</Label>
                <Input
                    id="city"
                    value={data.city}
                    {...register("city")}
                    aria-invalid={!!errors.city}
                />

                {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
            </div>


            <div className="grid gap-4 sm:grid-cols-2">
                {/* type */}
                <div className="space-y-2">
                    <Label htmlFor="type">Typ OH</Label>
                    <NativeSelect id="type" {...register("type")} aria-invalid={!!errors.type}>
                        <NativeSelectOption value="">Vyberte typ OH</NativeSelectOption>
                        <NativeSelectOption value="LOH">LOH</NativeSelectOption>
                        <NativeSelectOption value="ZOH">ZOH</NativeSelectOption>
                    </NativeSelect>

                    {errors.type && (
                        <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                </div>

                {/* year */}
                <div className="space-y-2">
                    <Label htmlFor="year">Rok konania</Label>
                    <Input
                        id="year"
                        type="number"
                        {...register("year", { valueAsNumber: true })}
                        aria-invalid={!!errors.year}
                    />

                    {errors.year && (
                        <p className="text-sm text-destructive">{errors.year.message}</p>
                    )}
                </div>
            </div>


            

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Ukladanie..." : "Uložiť"}
            </Button>
        </form>
  );
    
}