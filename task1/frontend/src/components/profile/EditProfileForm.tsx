import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// edit first name and last name
// pre-filled with current values from db

// PUT /api/user/profile
// {first_name, last_name}

const profileSchema = z.object({
    first_name: z.string().min(1, "Meno je povinné").max(100, "Meno nesmie presiahnuť 100 znakov"),
    last_name: z.string().min(1, "Priezvisko je povinné").max(100, "Priezvisko nesmie presiahnuť 100 znakov")
});

type ProfileFormValues = z.infer<typeof profileSchema>;


export function EditProfileForm() {
    const {refreshUser} = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, reset, formState: {errors}} = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        mode: "onBlur"
    });

    // pre-fill form with data from db
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const {data} = await api.get("/user/profile");
                reset({first_name: data.first_name, last_name: data.last_name});

            } catch {
                toast.error("Nepodarilo sa načítať profil");
            }
        };

        fetchProfile();
    }, [reset]);


    const onSubmit = async (values: ProfileFormValues) => {
        setSubmitting(true);

        try {
            await api.put("/user/profile", values);
            toast.success("Profil bol aktualizovaný");
            await refreshUser();    // update navbar user info

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri aktualizácii profilu";
            toast.error(message);

        } finally {
            setSubmitting(false);
        }
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="edit_first_name">Meno</Label>
                <Input
                    id="edit_first_name"
                    {...register("first_name")}
                    aria-invalid={!!errors.first_name}
                />

                {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit_last_name">Priezvisko</Label>
                <Input
                    id="edit_last_name"
                    {...register("last_name")}
                    aria-invalid={!!errors.last_name}
                />

                {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? "Ukladanie..." : "Uložiť zmeny"}
            </Button>
        </form>
    );
}