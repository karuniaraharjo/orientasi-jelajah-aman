import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: spacing.sedang,
        gap: spacing.sedang,
      }}
    >
      <Text
        accessibilityRole="header"
        accessibilityLabel="Tentang"
        style={{ fontSize: typeScale.judul, fontWeight: "bold" }}
      >
        Tentang
      </Text>
      <View style={{ gap: spacing.kecil }}>
        <Text style={{ fontSize: typeScale.subjudul, fontWeight: "600" }}>
          Jelajah Aman
        </Text>
        <Text style={{ fontSize: typeScale.isi }}>Versi 1.0.0</Text>
        <Text style={{ fontSize: typeScale.isi }}>
          Pembuat: Karunia Raharjo
        </Text>
      </View>
    </SafeAreaView>
  );
}
