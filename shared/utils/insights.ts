import { BeeRole } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: string): string {
  const insights: Record<BeeRole, Record<string, string>> = {
    İzci: {
      sert: "Piyasa bugün çok seçici. Sadece yüksek skorlu keşidecilerin çeklerini yüklemeni öneririm.",
      yumuşak: "Faktoringler bugün işlem kapma yarışında! Tüm çeklerini taratıp en iyi oranı yakalayabiliriz.",
      normal: "Bugün standart bir gün. Portföyündeki çekleri sisteme girip teklifleri toplamaya başlayalım.",
    },
    Aracı: {
      sert: "Revize turunda faktoringler pek esnemiyor. İlk gelen iyi teklifi kaçırmamak mantıklı olabilir.",
      yumuşak: "Müzakere gücümüz çok yüksek! Teklifler geldikten sonra mutlaka revize isteyelim.",
      normal: "Dengeli bir pazarlık ortamı var. Aradaki ufak farklar için revize butonunu kullanabiliriz.",
    },
    Kâtip: {
      sert: "Evrakların tam olması bugün her zamankinden daha kritik. Hızlı onay için net fotoğraflar çekelim.",
      yumuşak: "İşlem hacmi artıyor, çekleri hızlıca sisteme girersek gün bitmeden nakde dönebiliriz.",
      normal: "Çek detaylarını hatasız giriyorum, finans ekibine hazır paket sunuyoruz.",
    },
    Nabız: {
      sert: "Likidite daralıyor, bandın üst sınırına yakın oranlar görebiliriz. Nakit akışını sıkı tutalım.",
      yumuşak: "Piyasada iştah yüksek, oranlar bandın alt sınırına yakın seyrediyor. Fırsat günü!",
      normal: "Piyasa kendi dengesinde. Büyük sürprizler beklemiyoruz, plan dahilinde ilerleyebiliriz.",
    },
  };

  const roleInsights = insights[role] || insights["İzci"];
  return roleInsights[mood] || roleInsights["normal"];
}
