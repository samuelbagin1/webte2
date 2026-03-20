import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// change password form
// current password, new password, repeat
// only shown to local accounts

// PUT /api/users/{id}/password
// {current_password, new_password, new_password_repeat}


// register("password")
// returns:
// {
//   name: "password",
//   ref: [Function],
//   onChange: [Function],
//   onBlur: [Function],
// }



const passwordSchema = z.object({
    current_password: z.string().min(1, "Aktuálne heslo je povinné"),
    new_password: z.string().min(8, "Nové heslo musí mať aspoň 8 znakov")
        .regex(/[A-Z]/, "Nové heslo musí obsahovať aspoň jedno veľké písmeno").regex(/[0-9]/, "Nové heslo musí obsahovať aspoň jednu číslicu"),
    new_password_repeat: z.string()

}).refine((data) => data.new_password === data.new_password_repeat, {
    message: "Nové heslá sa nezhodujú",
    path: ["new_password_repeat"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>


export function ChangePasswordForm() {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, reset, formState: {errors}} = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        mode: "onBlur"
    });


    const onSubmit = async (values: PasswordFormValues) => {
        setSubmitting(true);

        try {
            await api.put(`/users/${user?.id}/password`, values);
            toast.success("Heslo bolo úspešne zmenené");
            reset();

        } catch (err: unknown) {
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Chyba pri zmene hesla";
            toast.error(message);

        } finally {
            setSubmitting(false);
        }
    };



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="current_password">Aktuálne heslo</Label>
                <Input
                    id="current_password"
                    type="password"
                    {...register("current_password")}
                    aria-invalid={!!errors.current_password}
                />

                {errors.current_password && (
                    <p className="text-sm text-destructive">{errors.current_password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="new_password">Nové heslo</Label>
                <Input
                    id="new_password"
                    type="password"
                    placeholder="Min. 8 znakov, veľké písmeno + číslo"
                    {...register("new_password")}
                    aria-invalid={!!errors.new_password}
                />

                {errors.new_password && (
                    <p className="text-sm text-destructive">{errors.new_password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="new_password_repeat">Nové heslo znova</Label>
                <Input
                    id="new_password_repeat"
                    type="password"
                    {...register("new_password_repeat")}
                    aria-invalid={!!errors.new_password_repeat}
                />

                {errors.new_password_repeat && (
                    <p className="text-sm text-destructive">{errors.new_password_repeat.message}</p>
                )}
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? "Mením heslo..." : "Zmeniť heslo"}
            </Button>
        </form>
    );
}