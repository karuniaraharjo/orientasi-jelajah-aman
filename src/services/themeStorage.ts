import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModeTema = "light" | "dark" | "system";

const KUNCI_TEMA = "@jelajah_aman:mode_tema";

export async function ambilModeTema(): Promise<ModeTema> {
  try {
    const nilai = await AsyncStorage.getItem(KUNCI_TEMA);
    if (nilai === "light" || nilai === "dark" || nilai === "system") {
      return nilai;
    }
  } catch (error) {
    console.error("Gagal membaca preferensi tema:", error);
  }
  return "system";
}

export async function simpanModeTema(mode: ModeTema): Promise<void> {
  try {
    await AsyncStorage.setItem(KUNCI_TEMA, mode);
  } catch (error) {
    console.error("Gagal menyimpan preferensi tema:", error);
  }
}
