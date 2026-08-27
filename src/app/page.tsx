"use client";

import { useState } from "react";
import { OrmasItem } from "@/types/ormas";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsDashboard from "@/components/StatsDashboard";
import OrmasDirectory from "@/components/OrmasDirectory";
import RegistrationFlow from "@/components/RegistrationFlow";
import OrmasDetailModal from "@/components/OrmasDetailModal";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedOrmas, setSelectedOrmas] = useState<OrmasItem | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Ringkasan Data Statistik */}
      <StatsDashboard />

      {/* Direktori / Tabel Data Ormas */}
      <OrmasDirectory onSelectOrmas={(ormas) => setSelectedOrmas(ormas)} />

      {/* Alur & Syarat Pendaftaran */}
      <RegistrationFlow />

      {/* Modal Profile / Detail Ormas */}
      <OrmasDetailModal
        ormas={selectedOrmas}
        onClose={() => setSelectedOrmas(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
