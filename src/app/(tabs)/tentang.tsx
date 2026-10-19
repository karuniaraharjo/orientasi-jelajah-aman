import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";
import { useAppTheme } from "../../contexts/ThemeContext";

export default function TabTentang() {
  const { warna } = useAppTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: warna.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing.sedang,
          gap: spacing.sedang,
        }}
      >
        <View style={{ alignItems: "center", paddingVertical: 20, gap: 12 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: warna.card,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: warna.cardBorder,
            }}
          >
            <Ionicons name="compass" size={42} color={warna.primary} />
          </View>
          <Text
            accessibilityRole="header"
            accessibilityLabel="Tentang Jelajah Aman"
            style={{
              fontSize: typeScale.judul,
              fontWeight: "bold",
              color: warna.text,
            }}
          >
            Jelajah Aman
          </Text>
          <Text style={{ fontSize: 13, color: warna.textSecondary }}>
            Aplikasi Informasi Cuaca & Kualitas Udara Ramah Offline
          </Text>
        </View>

        {/* Kartu Informasi Aplikasi */}
        <View
          style={{
            backgroundColor: warna.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: warna.cardBorder,
            padding: 16,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: warna.border,
              paddingBottom: 10,
            }}
          >
            <Text style={{ fontSize: typeScale.isi, color: warna.textSecondary }}>
              Versi Aplikasi
            </Text>
            <Text
              style={{
                fontSize: typeScale.isi,
                fontWeight: "600",
                color: warna.text,
              }}
            >
              1.0.0 (Release)
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: warna.border,
              paddingBottom: 10,
            }}
          >
            <Text style={{ fontSize: typeScale.isi, color: warna.textSecondary }}>
              Pengembang
            </Text>
            <Text
              style={{
                fontSize: typeScale.isi,
                fontWeight: "600",
                color: warna.text,
              }}
            >
              Karunia Raharjo
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: typeScale.isi, color: warna.textSecondary }}>
              Teknologi
            </Text>
            <Text
              style={{
                fontSize: typeScale.isi,
                fontWeight: "600",
                color: warna.text,
              }}
            >
              Expo SDK 57 & React Native
            </Text>
          </View>
        </View>

        {/* Fitur Utama */}
        <View
          style={{
            backgroundColor: warna.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: warna.cardBorder,
            padding: 16,
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: typeScale.subjudul,
              fontWeight: "700",
              color: warna.text,
            }}
          >
            Fitur Utama
          </Text>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Ionicons name="cloud-offline" size={18} color={warna.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: warna.text }}>
                  Offline-First Cuaca
                </Text>
                <Text style={{ fontSize: 12, color: warna.textSecondary }}>
                  Data cuaca tersimpan di SQLite lokal sehingga tetap dapat diakses saat tidak ada koneksi.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Ionicons name="time" size={18} color={warna.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: warna.text }}>
                  Riwayat Pencarian Otomatis
                </Text>
                <Text style={{ fontSize: 12, color: warna.textSecondary }}>
                  Menyimpan hingga 10 pencarian kota terakhir dengan akses instan.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Ionicons name="moon" size={18} color={warna.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: warna.text }}>
                  Mode Terang & Gelap
                </Text>
                <Text style={{ fontSize: 12, color: warna.textSecondary }}>
                  Pilihan tema fleksibel yang mendukung mode sistem maupun manual.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sumber Data */}
        <TouchableOpacity
          onPress={() => Linking.openURL("https://open-meteo.com/")}
          style={{
            backgroundColor: warna.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: warna.cardBorder,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="globe-outline" size={20} color={warna.primary} />
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: warna.text }}>
                Sumber Data Cuaca & AQI
              </Text>
              <Text style={{ fontSize: 11, color: warna.textSecondary }}>
                Open-Meteo Weather & Air Quality API
              </Text>
            </View>
          </View>
          <Ionicons name="open-outline" size={16} color={warna.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
