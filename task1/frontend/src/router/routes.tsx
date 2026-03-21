import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/router/ProtectedRoute";

import { HomePage } from "@/pages/HomePage";
import { AthleteDetailPage } from "@/pages/AthleteDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TwoFactorSetupPage } from "@/pages/TwoFactorSetupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { LoginHistoryPage } from "@/pages/LoginHistoryPage";
import { ImportPage } from "@/pages/ImportPage";
import { EditPage } from "@/pages/EditPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/athlete/:id" element={<AthleteDetailPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />

        {/* Protected routes — require login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login-history" element={<LoginHistoryPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/edit" element={<EditPage />} />
        </Route>
      </Route>
    </Routes>
  );
}