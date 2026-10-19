import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WeatherCard from "../../components/WeatherCard";
import { useAppTheme } from "../../contexts/ThemeContext";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();
  const { warna } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.background, padding: 16 }}>
      <View style={{ gap: 16 }}>
        <WeatherCard kota={kota} suhu={29} tingkatAQI="BAIK" />

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/tambah-favorit",
              params: {
                id: String(Date.now()),
                nama: kota,
                lat: "0",
                lon: "0",
              },
            })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: warna.primary,
            paddingVertical: 14,
            borderRadius: 12,
          }}
        >
          <Ionicons name="heart" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 15 }}>
            Tambahkan ke Favorit
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
