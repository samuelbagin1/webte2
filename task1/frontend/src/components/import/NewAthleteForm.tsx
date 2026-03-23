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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Controller } from "react-hook-form";


// registration form with full validation (onBlur)
// after success navigates to 2fa setup page with qr code data


const newAthleteSchema = z.object({
    name: z.string().min(1, "Meno je povinné"),
    surname: z.string().min(1, "Priezvisko je povinné"),
    birth_date: z.date({ message: "Dátum narodenia je povinný" }),
    birth_place: z.string().min(1, "Miesto narodenia je povinné"),
    birth_country: z.string().min(1, "Krajina narodenia je povinná"),
    death_date: z.date().nullable().optional(),
    death_place: z.string().nullable().optional(),
    death_country: z.string().nullable().optional(),

});

type NewAthleteFormValues = z.infer<typeof newAthleteSchema>;



interface NewAthleteFormProps {
    onCreated?: (athlete: { id: number; name: string; surname: string }) => void;
}

export function NewAthleteForm({ onCreated }: NewAthleteFormProps = {}) {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, control, formState: {errors}} = useForm<NewAthleteFormValues>({
        resolver: zodResolver(newAthleteSchema),
        mode: "onBlur"
    });

    const onSubmit = async (values: NewAthleteFormValues) => {
        setSubmitting(true);

        try {
            const payload = {
                ...values,
                birth_date: format(values.birth_date, "yyyy-MM-dd"),
                death_date: values.death_date ? format(values.death_date, "yyyy-MM-dd") : null,
            };

            const { data: res } = await api.post("/athletes", payload);
            toast.success("Nový atlét bol úspešne vytvorený.");
            if (onCreated) {
                onCreated({ id: res.id, name: values.name, surname: values.surname });
            } else {
                navigate("/edit");
            }

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri registrácii";
            toast.error(message)

        } finally {
            setSubmitting(false);
        }
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                {/* name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Meno</Label>
                    <Input
                        id="name"
                        placeholder="Ján"
                        {...register("name")}
                        aria-invalid={!!errors.name}
                    />

                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                {/* surname */}
                <div className="space-y-2">
                    <Label htmlFor="surname">Priezvisko</Label>
                    <Input
                        id="surname"
                        placeholder="Novák"
                        {...register("surname")}
                        aria-invalid={!!errors.surname}
                    />

                    {errors.surname && (
                        <p className="text-sm text-destructive">{errors.surname.message}</p>
                    )}
                </div>
            </div>



            <div className="grid gap-4 lg:grid-cols-7">
                {/* birth date */}
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="birth_date">Dátum narodenia</Label>
                    <Controller
                        name="birth_date"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start font-normal"
                                    >
                                        {field.value ? format(field.value, "PPP") : <span className="opacity-70">{format(new Date(), "d.M.yyyy")}</span>}
                                        <CalendarIcon className="ml-auto" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        captionLayout="dropdown"
                                        defaultMonth={field.value}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    
                    {errors.birth_date && (
                        <p className="text-sm text-destructive">{errors.birth_date.message}</p>
                    )}
                </div>

                {/* birth place */}
                <div className="space-y-2 col-span-5">
                    <Label htmlFor="birth_place">Obec narodenia</Label>
                    <Input
                        id="birth_place"
                        placeholder="Bratislava"
                        {...register("birth_place")}
                        aria-invalid={!!errors.birth_place}
                    />

                    {errors.birth_place && (
                        <p className="text-sm text-destructive">{errors.birth_place.message}</p>
                    )}
                </div>
            </div>

            {/* birth country */}
            <div className="space-y-2">
                <Label htmlFor="birth_country">Krajina narodenia</Label>
                <Input
                    id="birth_country"
                    placeholder="Krajina narodenia"
                    {...register("birth_country")}
                    aria-invalid={!!errors.birth_country}
                />

                {errors.birth_country && (
                    <p className="text-sm text-destructive">{errors.birth_country.message}</p>
                )}
            </div>


            <div className="h-6"></div>

            <div className="grid gap-4 lg:grid-cols-7">
                {/* death date */}
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="death_date">Dátum úmrtia</Label>
                    <Controller
                        name="death_date"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start font-normal"
                                    >
                                        {field.value ? format(field.value, "PPP") :  <span className="opacity-70">Vyberte dátum</span>}
                                        <CalendarIcon className="ml-auto" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value ?? undefined}
                                        onSelect={field.onChange}
                                        defaultMonth={field.value ?? undefined}
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.death_date && (
                        <p className="text-sm text-destructive">{errors.death_date.message}</p>
                    )}
                </div>


                {/* death place */}
                <div className="space-y-2 col-span-5">
                    <Label htmlFor="death_place">Obec úmrtia</Label>
                    <Input
                        id="death_place"
                        placeholder="Bratislava"
                        {...register("death_place")}
                        aria-invalid={!!errors.death_place}
                    />

                    {errors.death_place && (
                        <p className="text-sm text-destructive">{errors.death_place.message}</p>
                    )}
                </div>
            </div>


            {/* death country */}
            <div className="space-y-2">
                <Label htmlFor="death_country">Krajina úmrtia</Label>
                <Input
                    id="death_country"
                    placeholder="Vpíšte krajinu úmrtia"
                    {...register("death_country")}
                    aria-invalid={!!errors.death_country}
                />

                {errors.death_country && (
                    <p className="text-sm text-destructive">{errors.death_country.message}</p>
                )}
            </div>


            

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Vytváranie..." : "Vytvoriť"}
            </Button>
        </form>
  );
}