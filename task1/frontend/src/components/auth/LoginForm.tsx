import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

// local login form: email, password, totp 2fa code
// uses react-hook-form, zod for validation
// on success sets auth context + navigates to dashboard

const loginSchema = z.object({
    email: z.string().email("Neplatný formát e-mailu"),
    password: z.string().min(1, "Heslo je povinné"),
    totp: z.string().length(6, "TOTP kód musí mať 6 číslic").regex(/^\d{6}$/, "TOTP kód musí obsahovať iba číslice")
});

type LoginFormValues = z.infer<typeof loginSchema>;



export function LoginForm() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur"
    });

    const onSubmit = async (values: LoginFormValues) => {
        setSubmitting(true);

        try {
            const {data} = await api.post("/auth/login", values);
            login(data.user);
            toast.success("Úspešne prihlásený");
            navigate("/dashboard");

        } catch (err: unknown) {
            // typescript typecast: (err as {response?: {data?: {error?: string}}})
            // treat this as an object that might have response.data.error
            const message = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Nesprávne prihlasovacie údaje";
            toast.error(message);

        } finally {
            setSubmitting(false);
        }
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                    id="email"
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
                <Label htmlFor="password">Heslo</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Vaše heslo"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                />

                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            {/* TOTP 2FA Code */}
            <div className="space-y-2">
                <Label htmlFor="totp">2FA kód (Google Authenticator)</Label>
                <Input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    {...register("totp")}
                    aria-invalid={!!errors.totp}
                />
                
                {errors.totp && (
                    <p className="text-sm text-destructive">{errors.totp.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Prihlasovanie..." : "Prihlásiť sa"}
            </Button>
        </form>
    );
}