import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  nilaiAwal?: string;
}

export default function SearchBox({ onCari, nilaiAwal }: SearchBoxProps) {
  const [teks, setTeks] = useState(nilaiAwal ?? "");
  const { warna } = useAppTheme();

  useEffect(() => {
    if (nilaiAwal !== undefined && nilaiAwal !== teks) {
      setTeks(nilaiAwal);
    }
  }, [nilaiAwal]);

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  function handleBersihkan() {
    setTeks("");
    onCari("");
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: warna.card,
        borderWidth: 1,
        borderColor: warna.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={warna.textSecondary}
        style={{ marginRight: 8 }}
      />
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={warna.textSecondary}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          flex: 1,
          color: warna.text,
          fontSize: 16,
          paddingVertical: 4,
        }}
      />
      {teks.length > 0 && (
        <TouchableOpacity onPress={handleBersihkan} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={warna.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
