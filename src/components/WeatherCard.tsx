import { Text, View } from "react-native";
import { spacing, typeScale } from "../constants/styles";
import { useAppTheme } from "../contexts/ThemeContext";
import { TingkatAQI, WeatherCardProps } from "../types/cuaca";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#16A34A",
  SEDANG: "#EAB308",
  TIDAK_SEHAT: "#F97316",
  BERBAHAYA: "#EF4444",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { warna } = useAppTheme();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;
  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 16,
        backgroundColor: warna.card,
        borderWidth: 1,
        borderColor: warna.cardBorder,
        gap: 6,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: typeScale.judul,
          color: warna.text,
        }}
      >
        {kota}
      </Text>
      <Text
        style={{
          fontSize: 38,
          fontWeight: "700",
          color: warna.text,
        }}
      >
        {suhu}°C
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: warnaPerTingkat[tingkatAQI],
          }}
        />
        <Text
          style={{
            color: warnaPerTingkat[tingkatAQI],
            fontSize: typeScale.isi,
            fontWeight: "600",
          }}
        >
          {teksAQI}
        </Text>
      </View>
    </View>
  );
}
