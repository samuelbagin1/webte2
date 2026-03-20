import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useAuth } from "@/hooks/useAuth"

// edit user profile

// PUT /api/users/{id}
// {first_name, last_name}

// PUT /api/users/{id}/password
// {current_password, new_password, new_password_repeat}

export function ProfilePage() {
    const { user } = useAuth();


    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Nastavenia profilu</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Váš profil</CardTitle>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="profile">

                        <TabsList>
                            <TabsTrigger value="profile">Osobné údaje</TabsTrigger>

                            {/* Only show password change for local accounts */}
                            {user?.login_type === "LOCAL" && (
                                <TabsTrigger value="password">Zmena hesla</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="profile" className="mt-4">
                            <EditProfileForm />
                        </TabsContent>

                        {user?.login_type === "LOCAL" && (
                            <TabsContent value="password" className="mt-4">
                                <ChangePasswordForm />
                            </TabsContent>
                        )}

                    </Tabs>
                </CardContent>
            </Card>

        </div>
    )
}
