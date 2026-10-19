import { Linking, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";

export default function AtribusiCuaca() {
  const { warna } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL("https://open-meteo.com/")}
      style={{ paddingVertical: 12 }}
    >
      <Text style={{ fontSize: 11, color: warna.textSecondary, textAlign: "center" }}>
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}
