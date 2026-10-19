// src/app/(tabs)/pengaturan.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
import { hapusSemuaCache } from "../../services/cacheRepository";
import { hapusSemuaRiwayat } from "../../services/riwayatStorage";
import { ModeTema } from "../../services/themeStorage";

export default function TabPengaturan() {
  const { modeTema, setModeTema, warna, isDark } = useAppTheme();
  const [pesan, setPesan] = useState<string | null>(null);

  const pilihanTema: {
    mode: ModeTema;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    keterangan: string;
  }[] = [
    {
      mode: "light",
      label: "Terang",
      icon: "sunny",
      keterangan: "Tampilan cerah dengan latar putih",
    },
    {
      mode: "dark",
      label: "Gelap",
      icon: "moon",
      keterangan: "Tampilan gelap nyaman di mata",
    },
    {
      mode: "system",
      label: "Ikuti Sistem",
      icon: "phone-portrait-outline",
      keterangan: "Menyesuaikan otomatis dengan pengaturan perangkat",
    },
  ];

  function konfirmasiHapusSemuaCache() {
    const proses = async () => {
      await hapusSemuaCache();
      setPesan("Semua data cuaca tersimpan (cache) berhasil dihapus.");
      setTimeout(() => setPesan(null), 4000);
    };

    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm("Yakin ingin menghapus seluruh cache cuaca tersimpan di perangkat?");
      if (yakin) {
        proses();
      }
      return;
    }

    Alert.alert(
      "Konfirmasi Hapus Cache",
      "Yakin ingin menghapus seluruh cache data cuaca yang tersimpan di perangkat?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus Semua", style: "destructive", onPress: proses },
      ],
    );
  }

  function konfirmasiHapusRiwayat() {
    const proses = async () => {
      await hapusSemuaRiwayat();
      setPesan("Riwayat pencarian berhasil dibersihkan.");
      setTimeout(() => setPesan(null), 4000);
    };

    if (Platform.OS === "web") {
      const yakin =
        typeof window !== "undefined" &&
        window.confirm("Yakin ingin mengosongkan seluruh riwayat pencarian?");
      if (yakin) {
        proses();
      }
      return;
    }

    Alert.alert(
      "Bersihkan Riwayat",
      "Yakin ingin mengosongkan seluruh riwayat pencarian?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Bersihkan", style: "destructive", onPress: proses },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Sekilas */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: warna.text }}>
            Pengaturan
          </Text>
          <Text style={{ fontSize: 13, color: warna.textSecondary }}>
            Atur tema tampilan dan kelola data penyimpanan lokal aplikasi
          </Text>
        </View>

        {pesan && (
          <View
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: isDark ? "#064E3B" : "#D1FAE5",
              borderWidth: 1,
              borderColor: isDark ? "#059669" : "#6EE7B7",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="checkmark-circle" size={18} color={warna.success} />
            <Text
              style={{ color: warna.success, fontSize: 13, fontWeight: "600" }}
              accessibilityLabel={pesan}
            >
              {pesan}
            </Text>
          </View>
        )}

        {/* ================= PILIHAN TEMA ================= */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="color-palette-outline" size={20} color={warna.primary} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: warna.text }}>
              Mode Tampilan
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {pilihanTema.map((pilihan) => {
              const isSelected = modeTema === pilihan.mode;
              return (
                <TouchableOpacity
                  key={pilihan.mode}
                  onPress={() => setModeTema(pilihan.mode)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: warna.card,
                    borderWidth: 2,
                    borderColor: isSelected ? warna.primary : warna.cardBorder,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isSelected
                          ? isDark
                            ? "#1E3A8A"
                            : "#E0F2FE"
                          : warna.backgroundElement,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={pilihan.icon}
                        size={20}
                        color={isSelected ? warna.primary : warna.textSecondary}
                      />
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: warna.text,
                        }}
                      >
                        {pilihan.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: warna.textSecondary }}>
                        {pilihan.keterangan}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={
                      isSelected
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color={isSelected ? warna.primary : warna.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ================= MANAJEMEN PENYIMPANAN ================= */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="server-outline" size={20} color={warna.primary} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: warna.text }}>
              Penyimpanan & Cache
            </Text>
          </View>

          <View
            style={{
              backgroundColor: warna.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: warna.cardBorder,
              padding: 14,
              gap: 12,
            }}
          >
            <View>
              <Text style={{ fontSize: 15, fontWeight: "600", color: warna.text }}>
                Cache Data Cuaca Offline
              </Text>
              <Text style={{ fontSize: 12, color: warna.textSecondary, marginTop: 2 }}>
                Data cuaca yang disimpan di database SQLite lokal perangkat untuk akses tanpa internet.
              </Text>
            </View>

            <TouchableOpacity
              onPress={konfirmasiHapusSemuaCache}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: isDark ? "#451A1A" : "#FEE2E2",
                borderWidth: 1,
                borderColor: isDark ? "#782222" : "#FCA5A5",
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Ionicons name="trash-outline" size={16} color={warna.danger} />
              <Text style={{ color: warna.danger, fontWeight: "600", fontSize: 13 }}>
                Hapus Semua Cache Cuaca
              </Text>
            </TouchableOpacity>

            <View
              style={{
                height: 1,
                backgroundColor: warna.border,
                marginVertical: 4,
              }}
            />

            <View>
              <Text style={{ fontSize: 15, fontWeight: "600", color: warna.text }}>
                Riwayat Pencarian
              </Text>
              <Text style={{ fontSize: 12, color: warna.textSecondary, marginTop: 2 }}>
                Maksimal 10 daftar kota terakhir yang pernah Anda cari.
              </Text>
            </View>

            <TouchableOpacity
              onPress={konfirmasiHapusRiwayat}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: isDark ? "#3A2A1A" : "#FEF3C7",
                borderWidth: 1,
                borderColor: isDark ? "#784A1A" : "#FCD34D",
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Ionicons name="trash-bin-outline" size={16} color={warna.warning} />
              <Text style={{ color: warna.warning, fontWeight: "600", fontSize: 13 }}>
                Bersihkan Riwayat Pencarian
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= TENTANG APLIKASI ================= */}
        <View
          style={{
            backgroundColor: warna.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: warna.cardBorder,
            padding: 14,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: warna.text }}>
            Orientasi Jelajah Aman
          </Text>
          <Text style={{ fontSize: 12, color: warna.textSecondary }}>
            Versi 1.0.0 (Expo SDK 57)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
