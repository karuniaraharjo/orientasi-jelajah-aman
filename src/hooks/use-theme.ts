import { useAppTheme } from "@/contexts/ThemeContext";

export function useTheme() {
  try {
    const { warna } = useAppTheme();
    return warna;
  } catch {
    // Fallback jika dipanggil di luar ThemeProvider
    return require("@/constants/theme").Colors.light;
  }
}
