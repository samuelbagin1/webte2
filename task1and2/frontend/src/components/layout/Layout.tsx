import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// wraps all pages
// Navbar + content + Footer

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 bg-background">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}