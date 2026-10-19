import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { Colors } from "../constants/theme";
import {
  ambilModeTema,
  ModeTema,
  simpanModeTema,
} from "../services/themeStorage";

export type ThemeColors = Record<keyof typeof Colors.light, string>;

interface ThemeContextType {
  modeTema: ModeTema;
  temaAktif: "light" | "dark";
  warna: ThemeColors;
  isDark: boolean;
  setModeTema: (mode: ModeTema) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  modeTema: "system",
  temaAktif: "light",
  warna: Colors.light,
  isDark: false,
  setModeTema: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [modeTema, setModeTemaState] = useState<ModeTema>("system");
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    ambilModeTema().then((mode) => {
      setModeTemaState(mode);
      setMemuat(false);
    });
  }, []);

  const ubahModeTema = async (mode: ModeTema) => {
    setModeTemaState(mode);
    await simpanModeTema(mode);
  };

  const temaAktif: "light" | "dark" =
    modeTema === "system"
      ? deviceColorScheme === "dark"
        ? "dark"
        : "light"
      : modeTema;

  const warna = Colors[temaAktif];
  const isDark = temaAktif === "dark";

  return (
    <ThemeContext.Provider
      value={{
        modeTema,
        temaAktif,
        warna,
        isDark,
        setModeTema: ubahModeTema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme harus digunakan di dalam ThemeProvider");
  }
  return context;
}
