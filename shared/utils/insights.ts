import { BeeRole, DailyPulse } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: DailyPulse["mood"]): string {
  const insights: Record<BeeRole, Record<DailyPulse["mood"], string>> = {
    İzci: {
      sert: "Piyasa daralıyor, partner limitleri dolmadan evrakları iletelim.",
      normal: "Partner ağında hareketlilik var, yeni teklif kanalları açık.",
      yumuşak: "Likidite bol, bugün en çok partnerden teklif toplama rekoru kırabiliriz!",
    },
    Aracı: {
      sert: "Oranlar yüksek seyrediyor, revize turlarında fazla ısrarcı olmayalım.",
      normal: "Partnerlerle aramız iyi, ufak bir revize ile net ödemeyi artırabilirim.",
      yumuşak: "Rekabet kızışmış! Partnerleri birbirine kırdırıp en dip oranı alacağım.",
    },
    Kâtip: {
      sert: "Evrak eksiksiz olmalı, en küçük hata bu piyasada red sebebi olabilir.",
      normal: "Kayıtlar güncel, ERP entegrasyonu ile hızımıza hız katıyoruz.",
      yumuşak: "İşlem hacmi artıyor, otomatik eşleşme özelliğimiz harika çalışıyor.",
    },
    Nabız: {
      sert: "Genel endeks %4.5 üzerine çıktı, acil olmayan işlemler beklenebilir.",
      normal: "Vade bandı stabil, güvenli bölgedeyiz.",
      yumuşak: "Endeks %2.2 seviyelerine geriledi, finansman maliyetini düşürmek için tam zamanı!",
    },
  };

  return insights[role][mood] || "Kovanınız için çalışmaya devam ediyorum!";
}
