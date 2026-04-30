import { BeeRole, DailyPulse } from "@/contexts/UserContext";

const INSIGHTS: Record<BeeRole, Record<DailyPulse["mood"], string>> = {
  İzci: {
    sert: "Piyasada likidite düşük, İzci Arı olarak daha seçici davranmamız gerekebilir.",
    normal: "Piyasa taramalarım stabil, güvenilir keşideciler için fırsatlar görüyorum.",
    yumuşak: "Faktoring firmaları iştahlı! Bugün en yüksek teklifi bulma şansımız çok yüksek.",
  },
  Aracı: {
    sert: "Pazarlık masası bugün zorlu, ancak seviyem arttıkça daha iyi oranlar koparabilirim.",
    normal: "Revize turlarında %0.15 iyileştirme hedefimizi rahatça tutturabiliriz.",
    yumuşak: "Firmalar rekabete açık. Agresif revize talepleriyle net ödemeyi artırabiliriz!",
  },
  Kâtip: {
    sert: "Evrak eksikliği bugün işlem hızını %50 düşürebilir, her şeyi tam yükleyelim.",
    normal: "Çek verilerini ERP'den çekmek hata payımızı sıfıra indirir, hızı artırır.",
    yumuşak: "Hızlı veri girişiyle 15 dakika içinde teklifleri hazır edebiliriz.",
  },
  Nabız: {
    sert: "Endeks kırmızı bölgede. Keşideci skoru 80 altı olan çeklerde vadeye dikkat.",
    normal: "Piyasa nabzı ideal seviyede, portföy çeşitlendirmek için doğru zaman.",
    yumuşak: "Endeks yeşil! Uzun vadeli çekler için de rekabetçi oranlar yakalanabilir.",
  },
};

export function getBeeInsight(role: BeeRole, mood: DailyPulse["mood"]): string {
  return INSIGHTS[role][mood] || "Kovandaki çalışmalarımız devam ediyor, bol şans!";
}
