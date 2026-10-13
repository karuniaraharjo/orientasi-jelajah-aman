// src/services/locationService.ts
import * as Location from "expo-location";
import { Platform } from "react-native";

export type StatusIzinLokasi = "granted" | "denied" | "unavailable";

export async function mintaIzinLokasi(): Promise<StatusIzinLokasi> {
  try {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: "geolocation" });
          if (perm.state === "granted") return "granted";
          if (perm.state === "denied") return "denied";
        } catch {
          // Lanjut jika permissions.query tidak didukung
        }
      }

      return new Promise<StatusIzinLokasi>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          resolve("unavailable");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          () => resolve("granted"),
          async (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              resolve("denied");
            } else {
              // Jika timeout atau unavailable tapi izin sudah di-allow
              if (typeof navigator !== "undefined" && navigator.permissions) {
                try {
                  const p = await navigator.permissions.query({ name: "geolocation" });
                  if (p.state === "granted") {
                    resolve("granted");
                    return;
                  }
                } catch {
                  // ignore
                }
              }
              resolve("granted");
            }
          },
          { timeout: 6000, enableHighAccuracy: false }
        );
      });
    }

    const layananAktif = await Location.hasServicesEnabledAsync();
    if (!layananAktif) {
      return "unavailable";
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted" ? "granted" : "denied";
  } catch {
    return "unavailable";
  }
}

async function ambilKoordinatDariIP(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function ambilKoordinatSaatIni(): Promise<{ latitude: number; longitude: number }> {
  // Pada mobile, coba last known position terlebih dahulu jika ada
  if (Platform.OS !== "web") {
    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        return {
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        };
      }
    } catch {
      // lanjut ke getCurrentPosition
    }
  }

  const dapatkanLokasi = async (): Promise<{ latitude: number; longitude: number }> => {
    if (Platform.OS === "web") {
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          reject(new Error("Geolocation tidak didukung"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          (err) => reject(err),
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000,
          }
        );
      });
    }

    const lokasi = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: lokasi.coords.latitude,
      longitude: lokasi.coords.longitude,
    };
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout mengambil lokasi")), 6000)
  );

  try {
    return await Promise.race([dapatkanLokasi(), timeoutPromise]);
  } catch (error) {
    // Fallback ke IP geolocation jika GPS/layanan lokasi laptop macet
    const koordinatIP = await ambilKoordinatDariIP();
    if (koordinatIP) {
      return koordinatIP;
    }

    if (Platform.OS !== "web") {
      try {
        const last = await Location.getLastKnownPositionAsync({ maxAge: Infinity });
        if (last) {
          return {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          };
        }
      } catch {
        // ignore
      }
    }

    throw new Error("Gagal mendapatkan lokasi. Pastikan GPS/koneksi aktif.");
  }
}
