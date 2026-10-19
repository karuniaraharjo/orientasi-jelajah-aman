import AsyncStorage from "@react-native-async-storage/async-storage";
import { RiwayatPencarian } from "../types/riwayat";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
export const BATAS_MAKS_RIWAYAT = 10;

export async function ambilSemuaRiwayat(): Promise<RiwayatPencarian[]> {
  try {
    const data = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    if (!data) return [];
    return JSON.parse(data) as RiwayatPencarian[];
  } catch (error) {
    console.error("Gagal mengambil riwayat pencarian:", error);
    return [];
  }
}

export async function simpanRiwayat(
  item: Omit<RiwayatPencarian, "dicariPada">,
): Promise<void> {
  try {
    const riwayatLama = await ambilSemuaRiwayat();

    // Hapus jika sudah pernah ada (agar bisa dipindahkan ke posisi paling atas / terdepan)
    const disaring = riwayatLama.filter(
      (r) =>
        r.id !== item.id &&
        !(
          r.nama.toLowerCase() === item.nama.toLowerCase() &&
          Math.abs(r.latitude - item.latitude) < 0.01 &&
          Math.abs(r.longitude - item.longitude) < 0.01
        ),
    );

    const itemBaru: RiwayatPencarian = {
      ...item,
      dicariPada: Date.now(),
    };

    // Tambahkan di awal dan batasi hingga BATAS_MAKS_RIWAYAT
    const riwayatBaru = [itemBaru, ...disaring].slice(0, BATAS_MAKS_RIWAYAT);
    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(riwayatBaru));
  } catch (error) {
    console.error("Gagal menyimpan riwayat pencarian:", error);
  }
}

export async function hapusSatuRiwayat(id: number): Promise<void> {
  try {
    const riwayat = await ambilSemuaRiwayat();
    const baru = riwayat.filter((r) => r.id !== id);
    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(baru));
  } catch (error) {
    console.error("Gagal menghapus item riwayat:", error);
  }
}

export async function hapusSemuaRiwayat(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_RIWAYAT);
  } catch (error) {
    console.error("Gagal membersihkan riwayat:", error);
  }
}
