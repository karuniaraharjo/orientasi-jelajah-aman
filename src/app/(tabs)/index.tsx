// app/index.tsx
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
// Catatan: gunakan ../components/ jika file berada di dalam folder app/
// yang sejajar dengan folder components/
import { LaporanUdara } from "../../../types/cuaca";
import IndikatorAQI from "../../components/IndikatorAQI";
import RiwayatList from "../../components/RiwayatList";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);
  const laporanUdara: LaporanUdara = {
    kota: kotaAktif,
    indeksAQI: 42,
    tingkat: "BAIK",
    diperbaruiPada: "09:30 WIB",
  };
  // Tambahkan useEffect untuk mencatat perubahan kota aktif
  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);
  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }
  return (
    <View style={{ padding: 16, gap: 16 }}>
      <SearchBox onCari={handleCari} />
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>
          Ringkasan Hari Ini
        </Text>
        <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
        <IndikatorAQI laporan={laporanUdara} />
      </View>
      <RiwayatList daftarKota={riwayat} />
    </View>
  );
}
