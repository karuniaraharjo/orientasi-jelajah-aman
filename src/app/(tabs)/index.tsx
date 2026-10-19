// src/app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useDebounce } from "../../hooks/use-debounce";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheSatu,
} from "../../services/cacheRepository";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { simpanRiwayat } from "../../services/riwayatStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const { warna, isDark } = useAppTheme();
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const parameterTerakhirRef = useRef<string | null>(null);

  const params = useLocalSearchParams<{
    pilihId?: string;
    pilihNama?: string;
    pilihLat?: string;
    pilihLon?: string;
    ts?: string;
  }>();

  async function muatKotaTersimpan() {
    try {
      const data = await daftarKotaTersimpan();
      setKotaTersimpan(data);
    } catch (e) {
      console.error("Gagal memuat kota tersimpan:", e);
    }
  }

  // Muat data tersimpan saat tab fokus
  useFocusEffect(
    useCallback(() => {
      muatKotaTersimpan();
    }, []),
  );

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  // Tangani navigasi dari tab Riwayat dengan auto-trigger pencarian kota
  useEffect(() => {
    if (params.ts && params.ts !== parameterTerakhirRef.current) {
      parameterTerakhirRef.current = params.ts;
      if (params.pilihNama && params.pilihLat && params.pilihLon) {
        const kotaDariRiwayat: HasilGeocoding = {
          id: Number(params.pilihId) || Date.now(),
          name: params.pilihNama,
          latitude: Number(params.pilihLat),
          longitude: Number(params.pilihLon),
          country: "",
        };
        pilihKota(kotaDariRiwayat);
      }
    }
  }, [params.ts, params.pilihNama, params.pilihLat, params.pilihLon]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    // Simpan ke riwayat pencarian (maksimal 10 item disimpan secara otomatis)
    if (kota.id !== -1) {
      simpanRiwayat({
        id: kota.id,
        nama: kota.name,
        latitude: kota.latitude,
        longitude: kota.longitude,
        country: kota.country,
      }).catch((e) => console.error("Gagal simpan riwayat:", e));
    }

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);
      muatKotaTersimpan();
    } catch {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
      );
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
      );
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  function konfirmasiHapusCache(item: RingkasanKotaTersimpan) {
    const prosesHapus = async () => {
      try {
        await hapusCacheSatu(item.kunci);
        await muatKotaTersimpan();
      } catch (err) {
        console.error("Gagal menghapus cache item:", err);
      }
    };

    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm(
          `Yakin ingin menghapus cache cuaca offline untuk kota ${item.nama}?`,
        );
      if (yakin) {
        prosesHapus();
      }
      return;
    }

    Alert.alert(
      "Hapus Cache Kota",
      `Yakin ingin menghapus cache data cuaca offline untuk kota ${item.nama}?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: prosesHapus },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />

        <TouchableOpacity
          onPress={gunakanLokasiSaatIni}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: warna.primary,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
          }}
        >
          <Ionicons name="location" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 15 }}>
            Gunakan Lokasi Saat Ini
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <View
            style={{
              padding: 10,
              backgroundColor: isDark ? "#3E1A1A" : "#FEE2E2",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isDark ? "#782222" : "#FCA5A5",
            }}
          >
            <Text
              style={{ color: warna.danger, fontSize: 13 }}
              accessibilityLabel={pesanLokasi}
            >
              {pesanLokasi}
            </Text>
          </View>
        )}

        {/* Hasil Pencarian Geocoding Langsung */}
        {hasilPencarian.length > 0 && (
          <View
            style={{
              backgroundColor: warna.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: warna.cardBorder,
              overflow: "hidden",
            }}
          >
            {hasilPencarian.map((kota, idx) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => pilihKota(kota)}
                style={{
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomWidth:
                    idx === hasilPencarian.length - 1 ? 0 : 1,
                  borderBottomColor: warna.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="location-outline" size={18} color={warna.primary} />
                  <Text style={{ color: warna.text, fontSize: 15, fontWeight: "500" }}>
                    {kota.name}
                    {kota.country ? `, ${kota.country}` : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={warna.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Daftar Tersimpan di Perangkat (Cache Offline) */}
        {kotaTersimpan.length > 0 && (
          <View
            style={{
              backgroundColor: warna.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: warna.cardBorder,
              padding: 14,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="cloud-offline" size={18} color={warna.primary} />
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: warna.text,
                  }}
                >
                  Tersimpan di Perangkat (Offline)
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: warna.textSecondary }}>
                {kotaTersimpan.length} kota
              </Text>
            </View>

            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: warna.background,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: warna.cardBorder,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: warna.text,
                    }}
                  >
                    {k.nama}
                  </Text>
                  <Text style={{ fontSize: 11, color: warna.textSecondary }}>
                    Koordinat: {k.latitude.toFixed(2)}, {k.longitude.toFixed(2)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => konfirmasiHapusCache(k)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: isDark ? "#451A1A" : "#FEE2E2",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                  accessibilityLabel={`Hapus cache ${k.nama}`}
                >
                  <Ionicons name="trash-outline" size={14} color={warna.danger} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: warna.danger,
                    }}
                  >
                    Hapus Cache
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {sedangMemuat && (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator size="large" color={warna.primary} />
            <Text style={{ marginTop: 8, color: warna.textSecondary, fontSize: 13 }}>
              Mengambil data cuaca...
            </Text>
          </View>
        )}

        {pesanError && (
          <View
            style={{
              padding: 14,
              backgroundColor: isDark ? "#3E1A1A" : "#FEE2E2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#782222" : "#FCA5A5",
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="alert-circle" size={20} color={warna.danger} />
              <Text
                style={{ flex: 1, color: warna.danger, fontSize: 13 }}
                accessibilityLabel={pesanError}
              >
                {pesanError}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              style={{
                backgroundColor: warna.danger,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}>
                Coba Lagi
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hasil Cuaca Terpilih */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 12 }}>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />

            <View
              style={{
                backgroundColor: warna.card,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: warna.cardBorder,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="sunny-outline" size={20} color={warna.primary} />
                <Text style={{ fontSize: 13, color: warna.text }}>
                  Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="speedometer-outline" size={18} color={warna.textSecondary} />
                <Text style={{ fontSize: 13, color: warna.textSecondary }}>
                  {hasil.cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => pilihKota(kotaTerpilih, true)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 12,
                  backgroundColor: warna.card,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: warna.cardBorder,
                }}
              >
                <Ionicons name="refresh" size={16} color={warna.primary} />
                <Text style={{ color: warna.primary, fontWeight: "600", fontSize: 14 }}>
                  Perbarui
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 12,
                  backgroundColor: warna.primary,
                  borderRadius: 10,
                }}
              >
                <Ionicons name="heart" size={16} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>
                  Tambah Favorit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
