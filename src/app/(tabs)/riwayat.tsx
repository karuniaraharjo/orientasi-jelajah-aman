// src/app/(tabs)/riwayat.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../contexts/ThemeContext";
import { hapusCacheDenganKoordinat } from "../../services/cacheRepository";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilSemuaRiwayat,
  hapusSatuRiwayat,
  hapusSemuaRiwayat,
} from "../../services/riwayatStorage";
import { KotaFavorit } from "../../types/favorit";
import { RiwayatPencarian } from "../../types/riwayat";

function formatWaktu(ts: number): string {
  const selisih = Date.now() - ts;
  const menit = Math.floor(selisih / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

export default function TabRiwayat() {
  const { warna, isDark } = useAppTheme();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<RiwayatPencarian[]>([]);
  const [tabAktif, setTabAktif] = useState<"riwayat" | "favorit">("riwayat");

  const muatData = useCallback(async () => {
    try {
      const [fav, riw] = await Promise.all([
        ambilSemuaFavorit(),
        ambilSemuaRiwayat(),
      ]);
      setDaftarFavorit(fav);
      setDaftarRiwayat(riw);
    } catch (e) {
      console.error("Gagal memuat data riwayat / favorit:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData]),
  );

  function bukaDiBeranda(kota: {
    id: number;
    nama: string;
    latitude: number;
    longitude: number;
  }) {
    router.navigate({
      pathname: "/(tabs)",
      params: {
        pilihId: String(kota.id),
        pilihNama: kota.nama,
        pilihLat: String(kota.latitude),
        pilihLon: String(kota.longitude),
        ts: String(Date.now()),
      },
    });
  }

  // --- Hapus Favorit ---
  async function lakukanHapusFavorit(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm(`Yakin ingin menghapus ${kota.nama} dari daftar favorit?`);
      if (yakin) {
        lakukanHapusFavorit(kota.id);
      }
      return;
    }

    Alert.alert("Hapus Favorit", `Yakin ingin menghapus ${kota.nama} dari daftar favorit?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => lakukanHapusFavorit(kota.id),
      },
    ]);
  }

  // --- Hapus Riwayat ---
  async function lakukanHapusRiwayat(id: number) {
    await hapusSatuRiwayat(id);
    setDaftarRiwayat((prev) => prev.filter((r) => r.id !== id));
  }

  function konfirmasiHapusRiwayat(item: RiwayatPencarian) {
    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm(`Hapus pencarian ${item.nama} dari riwayat?`);
      if (yakin) {
        lakukanHapusRiwayat(item.id);
      }
      return;
    }

    Alert.alert("Hapus Riwayat", `Hapus pencarian ${item.nama} dari riwayat?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => lakukanHapusRiwayat(item.id),
      },
    ]);
  }

  function konfirmasiBersihkanSemuaRiwayat() {
    const proses = async () => {
      await hapusSemuaRiwayat();
      setDaftarRiwayat([]);
    };

    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm("Yakin ingin menghapus semua riwayat pencarian?");
      if (yakin) {
        proses();
      }
      return;
    }

    Alert.alert(
      "Bersihkan Riwayat",
      "Yakin ingin menghapus semua riwayat pencarian terakhir?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus Semua", style: "destructive", onPress: proses },
      ],
    );
  }

  // --- Hapus Cache dari item riwayat ---
  function konfirmasiHapusCacheKota(nama: string, lat: number, lon: number) {
    const proses = async () => {
      await hapusCacheDenganKoordinat(lat, lon);
      if (Platform.OS === "web") {
        window.alert(`Cache cuaca untuk ${nama} berhasil dihapus.`);
      } else {
        Alert.alert("Berhasil", `Cache cuaca untuk ${nama} berhasil dihapus.`);
      }
    };

    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm(`Hapus data cache cuaca offline untuk ${nama}?`);
      if (yakin) {
        proses();
      }
      return;
    }

    Alert.alert(
      "Hapus Cache Kota",
      `Hapus data cache cuaca offline untuk ${nama}?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus Cache", style: "destructive", onPress: proses },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tab Switcher: Riwayat Pencarian vs Kota Favorit */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: warna.card,
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: warna.cardBorder,
          }}
        >
          <TouchableOpacity
            onPress={() => setTabAktif("riwayat")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor:
                tabAktif === "riwayat"
                  ? warna.backgroundSelected
                  : "transparent",
            }}
          >
            <Ionicons
              name="time"
              size={18}
              color={tabAktif === "riwayat" ? warna.primary : warna.textSecondary}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: tabAktif === "riwayat" ? warna.text : warna.textSecondary,
              }}
            >
              Riwayat ({daftarRiwayat.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTabAktif("favorit")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor:
                tabAktif === "favorit"
                  ? warna.backgroundSelected
                  : "transparent",
            }}
          >
            <Ionicons
              name="heart"
              size={18}
              color={tabAktif === "favorit" ? "#EF4444" : warna.textSecondary}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: tabAktif === "favorit" ? warna.text : warna.textSecondary,
              }}
            >
              Favorit ({daftarFavorit.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION RIWAYAT PENCARIAN ================= */}
        {tabAktif === "riwayat" && (
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: warna.text,
                }}
              >
                10 Pencarian Terakhir
              </Text>

              {daftarRiwayat.length > 0 && (
                <TouchableOpacity
                  onPress={konfirmasiBersihkanSemuaRiwayat}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="trash-bin-outline" size={14} color={warna.danger} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: warna.danger,
                      fontWeight: "600",
                    }}
                  >
                    Bersihkan
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {daftarRiwayat.length === 0 ? (
              <View
                style={{
                  padding: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: warna.card,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: warna.cardBorder,
                  gap: 8,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={42}
                  color={warna.textSecondary}
                />
                <Text
                  style={{
                    color: warna.textSecondary,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Belum ada riwayat pencarian. Cari kota di tab Beranda untuk menyimpannya di sini.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {daftarRiwayat.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: warna.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: warna.cardBorder,
                      padding: 12,
                      gap: 8,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => bukaDiBeranda(item)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color={warna.primary}
                          />
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: warna.text,
                            }}
                          >
                            {item.nama}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            color: warna.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {formatWaktu(item.dicariPada)} • {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                        </Text>
                      </View>

                      <Ionicons
                        name="arrow-forward-circle"
                        size={24}
                        color={warna.primary}
                      />
                    </TouchableOpacity>

                    {/* Tombol aksi: Hapus Cache & Hapus dari Riwayat */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 8,
                        borderTopWidth: 1,
                        borderTopColor: warna.border,
                        paddingTop: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          konfirmasiHapusCacheKota(
                            item.nama,
                            item.latitude,
                            item.longitude,
                          )
                        }
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: isDark ? "#2A281E" : "#FEF3C7",
                        }}
                      >
                        <Ionicons
                          name="cloud-offline-outline"
                          size={13}
                          color={warna.warning}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: warna.warning,
                          }}
                        >
                          Hapus Cache
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => konfirmasiHapusRiwayat(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: isDark ? "#451A1A" : "#FEE2E2",
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={13}
                          color={warna.danger}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: warna.danger,
                          }}
                        >
                          Hapus
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= SECTION KOTA FAVORIT ================= */}
        {tabAktif === "favorit" && (
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: warna.text,
              }}
            >
              Daftar Kota Favorit
            </Text>

            {daftarFavorit.length === 0 ? (
              <View
                style={{
                  padding: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: warna.card,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: warna.cardBorder,
                  gap: 8,
                }}
              >
                <Ionicons
                  name="heart-outline"
                  size={42}
                  color={warna.textSecondary}
                />
                <Text
                  style={{
                    color: warna.textSecondary,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Belum ada kota favorit. Tambahkan kota favorit dari hasil pencarian di Beranda.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {daftarFavorit.map((kota) => (
                  <View
                    key={kota.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: warna.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: warna.cardBorder,
                      padding: 14,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => bukaDiBeranda(kota)}
                      style={{ flex: 1 }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="heart" size={18} color="#EF4444" />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: warna.text,
                          }}
                        >
                          {kota.nama}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: warna.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {kota.latitude.toFixed(2)}, {kota.longitude.toFixed(2)} • Ketuk untuk lihat cuaca
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <TouchableOpacity
                        onPress={() =>
                          konfirmasiHapusCacheKota(
                            kota.nama,
                            kota.latitude,
                            kota.longitude,
                          )
                        }
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: isDark ? "#2A281E" : "#FEF3C7",
                        }}
                        accessibilityLabel={`Hapus cache ${kota.nama}`}
                      >
                        <Ionicons
                          name="cloud-offline-outline"
                          size={16}
                          color={warna.warning}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => konfirmasiHapusFavorit(kota)}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: isDark ? "#451A1A" : "#FEE2E2",
                        }}
                        accessibilityLabel={`Hapus favorit ${kota.nama}`}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={warna.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
