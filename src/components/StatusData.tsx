import { Text, View } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";
import { SumberData } from "../types/cache";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const { warna, isDark } = useAppTheme();
  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  const bgColor = basi
    ? isDark
      ? "#3E2611"
      : "#FEF3E2"
    : isDark
      ? "#0F3323"
      : "#EAFBF6";

  const textColor = basi
    ? isDark
      ? "#FDBA74"
      : "#B45309"
    : isDark
      ? "#6EE7B7"
      : "#13795F";

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{
        padding: 10,
        borderRadius: 10,
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: basi ? (isDark ? "#78350F" : "#FDE68A") : (isDark ? "#065F46" : "#A7F3D0"),
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: textColor }}>
        {label}
      </Text>
      <Text style={{ fontSize: 11, color: warna.textSecondary, marginTop: 2 }}>
        Diperbarui {umur}
      </Text>
    </View>
  );
}
