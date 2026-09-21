import { StyleSheet, Text, View } from "react-native";

import { LaporanUdara } from "../../types/cuaca";

interface IndikatorAQIProps {
  laporan: LaporanUdara;
}

const warnaTingkat: Record<LaporanUdara["tingkat"], string> = {
  BAIK: "#15803d",
  SEDANG: "#b45309",
  TIDAK_SEHAT: "#c2410c",
  BERBAHAYA: "#b91c1c",
};

export default function IndikatorAQI({ laporan }: IndikatorAQIProps) {
  const warnaStatus = warnaTingkat[laporan.tingkat];

  return (
    <View style={styles.kartu}>
      <Text style={styles.kota}>{laporan.kota}</Text>
      <Text style={[styles.indeks, { color: warnaStatus }]}>
        {laporan.indeksAQI}
      </Text>
      <Text style={[styles.tingkat, { color: warnaStatus }]}>
        Kualitas udara: {laporan.tingkat}
      </Text>
      {laporan.diperbaruiPada ? (
        <Text style={styles.waktu}>
          Diperbarui pada {laporan.diperbaruiPada}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kartu: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  kota: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  indeks: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 44,
  },
  tingkat: {
    fontSize: 16,
    fontWeight: "600",
  },
  waktu: {
    fontSize: 12,
    color: "#475569",
  },
});
