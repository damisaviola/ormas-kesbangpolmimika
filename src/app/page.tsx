import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsDashboard from "@/components/StatsDashboard";
import OrmasDirectory from "@/components/OrmasDirectory";
import RegistrationFlow from "@/components/RegistrationFlow";
import Footer from "@/components/Footer";
import { OrmasItem } from "@/types/ormas";

// Pastikan selalu query langsung ke MySQL (SSR) setiap kali halaman diakses / direfresh
export const dynamic = "force-dynamic";

async function getOrmasFromDatabase(): Promise<OrmasItem[]> {
  try {
    const list = await prisma.ormas.findMany({
      include: {
        user: true,
        pengurus: true,
        pengajuan: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return list.map((item) => {
      const ketua =
        item.pengurus.find((p) => p.jabatan === "Ketua Umum")?.nama ||
        item.pengurus[0]?.nama ||
        item.user?.nama ||
        "-";

      const cleanDistrik = item.distrik || "Mimika Baru";
      const fullAddress = item.alamatSekretariat
        ? `${item.alamatSekretariat}, Distrik ${cleanDistrik}`
        : `Distrik ${cleanDistrik}`;

      const isResmi =
        item.statusSkt === "Aktif" ||
        item.statusSkt === "Resmi" ||
        Boolean(item.nomorSkt) ||
        item.pengajuan[0]?.status === "resmi" ||
        item.pengajuan[0]?.status === "disetujui";

      const statusPublik: "Resmi" | "Dalam Proses" = isResmi ? "Resmi" : "Dalam Proses";
      const nomorSkt =
        item.nomorSkt ||
        item.pengajuan[0]?.nomorRegistrasi ||
        item.pengajuan[0]?.nomorTiket ||
        "Dalam Verifikasi";

      const tglDaftar =
        item.tanggalPendirian ||
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      return {
        id: item.id,
        nama: item.namaOrmas,
        singkatan: item.singkatan || "",
        jenis: item.jenisOrmas || "ORMAS",
        kategori: item.kategori || item.jenisOrmas || "Lembaga Swadaya Masyarakat",
        status: statusPublik,
        noSkt: nomorSkt,
        ketua: ketua,
        alamat: fullAddress,
        distrik: cleanDistrik,
        tanggalDaftar: tglDaftar,
        telepon: item.teleponKantor || item.user?.telepon || "-",
        email: item.emailResmi || item.user?.email || "-",
        kodePos: item.kodePos || "99910",
        alamatSekretariat: item.alamatSekretariat,
        kelurahanDesa: item.kelurahanDesa || "-",
        kabupaten: item.kabupaten || "Kabupaten Mimika",
        provinsi: item.provinsi || "Papua Tengah",
        nomorAktaNotaris: item.nomorAktaNotaris || "-",
        namaNotaris: item.namaNotaris || "-",
        npwpOrmas: item.npwpOrmas || "-",
        tanggalTerbitSkt: item.tanggalTerbitSkt || "-",
        masaBerlakuSkt: item.masaBerlakuSkt || "-",
        statusSkt: item.statusSkt,
        websiteSosmed: item.websiteSosmed || "-",
        visiMisi: item.visiMisi || "-",
        tujuanOrganisasi: item.tujuanOrganisasi || "-",
        tanggalPendirian: item.tanggalPendirian || tglDaftar,
      };
    });
  } catch (error) {
    console.error("Gagal mengambil data ormas langsung dari database MySQL:", error);
    return [];
  }
}

export default async function Home() {
  const ormasList = await getOrmasFromDatabase();

  const total = ormasList.length;
  const resmi = ormasList.filter((item) => item.status === "Resmi").length;
  const proses = total - resmi;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Ringkasan Data Statistik (Langsung Sinkron dari DB) */}
      <StatsDashboard initialStats={{ total, resmi, proses }} />

      {/* Direktori / Tabel Data Ormas (Langsung Sinkron dari DB) */}
      <OrmasDirectory initialData={ormasList} />

      {/* Alur & Syarat Pendaftaran */}
      <RegistrationFlow />

      {/* Footer */}
      <Footer />
    </div>
  );
}
