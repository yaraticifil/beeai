import { BeeRole } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: "sert" | "normal" | "yumuşak"): string {
  const insights: Record<BeeRole, Record<string, string>> = {
    "İzci": {
      "sert": "Piyasa daralıyor, ancak Arıkan İnşaat gibi yüksek skorlu firmalar hala güvenli liman.",
      "normal": "Bugün veri akışı stabil. Keşideci analizlerim 15 dakika içinde sonuçlanıyor.",
      "yumuşak": "Likidite yüksek! Tüm firmalar için limitler esniyor, yeni fırsatlar kapıda."
    },
    "Aracı": {
      "sert": "Faktoring şirketleri bugün biraz daha 'cimri'. Ama Aracı seviyem sayesinde oranları zorluyorum.",
      "normal": "Dengeli bir gün. Revize talepleri genellikle %5-10 iyileştirme getiriyor.",
      "yumuşak": "Bugün revize istemek için harika bir gün! Oranları dibe çekebiliriz."
    },
    "Kâtip": {
      "sert": "Evrakların tam olması bugün her zamankinden daha önemli. Eksik bilgi süreci çok uzatır.",
      "normal": "ERP entegrasyonuyla çekleri yüklemek hızımızı 2 kat artıracaktır.",
      "yumuşak": "Hızlı işlem sırası boş! Çekleri hemen yükleyin, saniyeler içinde analiz edelim."
    },
    "Nabız": {
      "sert": "Vade bandı yukarı yönlü. Nakit akışınızı korumak için bugün erken aksiyon alın.",
      "normal": "Piyasa standart ritminde. Gelecek hafta için şimdiden planlama yapabilirsiniz.",
      "yumuşak": "Faiz baskısı azalıyor. Uzun vadeli çekleriniz için bugün en iyi teklifleri alabiliriz."
    }
  };

  return insights[role][mood] || "Arılarımız sizin için çalışıyor!";
}
