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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"


const newOlympicsSchema = z.object({
    host_country: z.string().min(1, "Hosťujúca krajina je povinný údaj"),
    type: z.enum(["LOH", "ZOH"], { error: "Typ OH je povinný údaj" }),
    year: z.number().min(1, "Rok OH je povinný údaj"),
    city: z.string().min(1, "Mesto hosťujúce OH je povinný údaj"),
    code: z.string().min(1, "Skratka hosťujúcej krajiny je povinný údaj"),
});

type NewOlympicsFormValues = z.infer<typeof newOlympicsSchema>;

interface NewOlympicsFormProps {
    onCreated?: (olympics: { id: number; type: string; year: number; city: string; host_country: string }) => void;
}

export function NewOlympicsForm({ onCreated }: NewOlympicsFormProps = {}) {
     const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<NewOlympicsFormValues>({
        resolver: zodResolver(newOlympicsSchema),
        mode: "onBlur"
    });

    const onSubmit = async (values: NewOlympicsFormValues) => {
        setSubmitting(true);

        try {
            const { data: res } = await api.post("/olympics", values);
            toast.success("Nová olympiáda bola úspešne vytvorená.");
            if (onCreated) {
                onCreated({ id: res.id, type: res.type, year: res.year, city: res.city, host_country: res.host_country });
            } else {
                navigate("/edit");
            }

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri vytvorení novej olympiády";
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
                        placeholder="Slovensko"
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
                        placeholder="SVK"
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
                    placeholder="Bratislava"
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
                        placeholder="2028"
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
                {submitting ? "Vytváranie..." : "Vytvoriť"}
            </Button>
        </form>
  );
    
}