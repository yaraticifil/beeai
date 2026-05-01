import { BeeRole } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: "sert" | "normal" | "yumuşak"): string {
  const insights: Record<BeeRole, Record<string, string>> = {
    İzci: {
      sert: "Piyasa daralıyor, sadece en güvenilir keşidecileri kovanına taşı.",
      normal: "Piyasa dengeli, yeni fırsatlar için keşif uçuşuna çıkabilirsin.",
      yumuşak: "Her tarafta fırsat var! Bol bol çek yükle, arıların toplasın.",
    },
    Aracı: {
      sert: "Partnerler bugün zorlu, ama müzakereci gücünle en iyi oranı koparacağız.",
      normal: "Standart revize turları bugün iyi sonuç verir.",
      yumuşak: "Müzakere için harika bir gün. Partnerler tekliflerini iyileştirmeye çok istekli.",
    },
    Kâtip: {
      sert: "Evrakların eksiksiz olması bugün her zamankinden daha kritik.",
      normal: "Veri girişlerini tamamladım, teklifler gelmeye hazır.",
      yumuşak: "Hızlı veri girişiyle piyasadaki bolluğu hemen nakde çevirelim.",
    },
    Nabız: {
      sert: "Piyasa nabzı yüksek. Nakit akışını korumak için hızlı teklifleri değerlendir.",
      normal: "Nabız stabil. Stratejini bozmadan devam edebilirsin.",
      yumuşak: "Piyasa çok sakin ve verimli. Uzun vadeli planlar için doğru zaman.",
    },
  };

  return insights[role]?.[mood] || "Arın senin için piyasayı izliyor!";
}
