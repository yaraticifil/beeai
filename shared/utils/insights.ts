import { BeeRole, DailyPulse } from "@/contexts/UserContext";

const INSIGHTS: Record<BeeRole, Record<DailyPulse["mood"], string>> = {
  İzci: {
    sert: "Piyasa oldukça seçici. Sadece yüksek skorlu keşidecilerin çekleri hızlı teklif alabiliyor.",
    normal: "Bugün standart bir gün. Çeklerin DNA'sı temizse partnerler iştahlı davranacaktır.",
    yumuşak: "Herkes işlem peşinde! En ufak bir evrakla bile çok sayıda teklif toplayabiliriz.",
  },
  Aracı: {
    sert: "Partnerlerin eli sıkı. Revize turlarında büyük indirimler beklemeyin, ama yine de zorlayacağım.",
    normal: "Pazarlık payı var. Revize isteyerek net ödemeyi bir miktar daha yukarı çekebiliriz.",
    yumuşak: "Faktoring firmaları limit doldurmaya çalışıyor. Revize taleplerine çok olumlu döneceklerdir.",
  },
  Kâtip: {
    sert: "Veri girişi hatasız olmalı. Risk birimleri en küçük pürüzde işlemi reddedebilir.",
    normal: "Faturaları eklemeyi unutmayın. İşlem hızını %30 artıracaktır.",
    yumuşak: "Hızlıca giriş yapalım, piyasadaki bu bolluğu kaçırmadan teklifleri toplayalım.",
  },
  Nabız: {
    sert: "Likitide daralması var. Nakit akışınızı korumak için oranlara çok takılmadan ilerlemek mantıklı olabilir.",
    normal: "Dengeli seyir. Vade bandı stabil, acele etmeden en iyi 3 teklifi bekleyelim.",
    yumuşak: "Bugün fırsat günü! Normalden daha düşük oranlarla iskonto yapmak mümkün.",
  },
};

export function getBeeInsight(role: BeeRole, mood: DailyPulse["mood"]): string {
  return INSIGHTS[role][mood] || "Arılar şu an analiz yapıyor, birazdan dönecekler.";
}
