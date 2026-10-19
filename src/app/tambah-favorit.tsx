import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { warna } = useAppTheme();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    await tambahFavorit({
      id: Number(id),
      nama,
      latitude: Number(lat),
      longitude: Number(lon),
    });
    router.back();
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: warna.background,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: warna.card,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: warna.cardBorder,
        }}
      >
        <Ionicons name="heart" size={32} color="#EF4444" />
      </View>

      <View style={{ alignItems: "center", gap: 6 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: warna.text,
            textAlign: "center",
          }}
        >
          Tambah ke Favorit?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: warna.textSecondary,
            textAlign: "center",
          }}
        >
          Apakah Anda ingin menyimpan {nama} ke daftar kota favorit untuk akses cepat?
        </Text>
      </View>

      <View style={{ width: "100%", gap: 10, marginTop: 12 }}>
        <TouchableOpacity
          onPress={simpan}
          style={{
            backgroundColor: warna.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
            Simpan ke Favorit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: warna.card,
            borderWidth: 1,
            borderColor: warna.cardBorder,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: warna.text, fontWeight: "600", fontSize: 15 }}>
            Batal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
