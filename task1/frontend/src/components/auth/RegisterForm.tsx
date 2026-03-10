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

// registration form with full validation (onBlur)
// after success navigates to 2fa setup page with qr code data


const registerSchema = z.object({
    first_name: z.string().min(1, "Meno je povinné").max(100, "Meno nesmie presiahnuť 100 znakov"),
    last_name: z.string().min(1, "Priezvisko je povinné").max(100, "Priezvisko nesmie presiahnuť 100 znakov"),
    email: z.string().email("Neplatný formát e-mailu"),
    password: z.string().min(8, "Heslo musí mať aspoň 8 znakov").regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno").regex(/[0-9]/, "Heslo musí obsahovať aspoň jednu číslicu"),
    password_repeat: z.string()

}).refine((data) => data.password === data.password_repeat, {
    message: "Heslá sa nezhodujú",
    path: ["password_repeat"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;



export function RegisterForm() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onBlur"
    });

    const onSubmit = async (values: RegisterFormValues) => {
        setSubmitting(true);

        try {
            const {data} = await api.post("/auth/register", values);
            toast.success("Registrácia úspešná! Nastavte si 2FA.");
            
            navigate("/2fa-setup", {
                state: {
                    qr_code: data.qr_code,
                    tfa_secret: data.tfa_secret
                }
            });

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
                {/* First name */}
                <div className="space-y-2">
                    <Label htmlFor="first_name">Meno</Label>
                    <Input
                        id="first_name"
                        placeholder="Ján"
                        {...register("first_name")}
                        aria-invalid={!!errors.first_name}
                    />

                    {errors.first_name && (
                        <p className="text-sm text-destructive">{errors.first_name.message}</p>
                    )}
                </div>

                {/* Last name */}
                <div className="space-y-2">
                    <Label htmlFor="last_name">Priezvisko</Label>
                    <Input
                        id="last_name"
                        placeholder="Novák"
                        {...register("last_name")}
                        aria-invalid={!!errors.last_name}
                    />

                    {errors.last_name && (
                        <p className="text-sm text-destructive">{errors.last_name.message}</p>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="reg_email">E-mail</Label>
                <Input
                    id="reg_email"
                    type="email"
                    placeholder="vas@email.sk"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                />

                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="reg_password">Heslo</Label>
                <Input
                    id="reg_password"
                    type="password"
                    placeholder="Min. 8 znakov, veľké písmeno + číslo"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                />

                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            {/* Password repeat */}
            <div className="space-y-2">
                <Label htmlFor="password_repeat">Heslo znova</Label>
                <Input
                    id="password_repeat"
                    type="password"
                    placeholder="Zopakujte heslo"
                    {...register("password_repeat")}
                    aria-invalid={!!errors.password_repeat}
                />

                {errors.password_repeat && (
                    <p className="text-sm text-destructive">{errors.password_repeat.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Registrácia..." : "Zaregistrovať sa"}
            </Button>
        </form>
  );
}