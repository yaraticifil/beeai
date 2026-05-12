import { BeeRole, DailyPulse } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: DailyPulse["mood"]): string {
  const insights: Record<BeeRole, Record<DailyPulse["mood"], string>> = {
    İzci: {
      sert: "Piyasa daralıyor, yeni fırsatlar için daha derin tarama yapıyorum.",
      normal: "Standart tarama aktif, güvenilir partnerleri izliyorum.",
      yumuşak: "Fırsatlar bol! En hızlı dönen partnerleri listeledim.",
    },
    Aracı: {
      sert: "İskonto oranları katı, ancak hacimli çekler için pazarlık payı zorluyorum.",
      normal: "Orta yolda buluşmak için uygun bir zemin var.",
      yumuşak: "Partnerler iştahlı, revize turlarında agresif davranabiliriz.",
    },
    Kâtip: {
      sert: "Evrak kusursuz olmalı, en küçük hata reddedilme sebebi olabilir.",
      normal: "Kayıtlar düzenli, operasyonel süreç tıkır tıkır işliyor.",
      yumuşak: "Hızlı girişler yapıyoruz, veri doğruluğu %100.",
    },
    Nabız: {
      sert: "Risk iştahı düşük, vadeler kısalabilir. Dikkatli olun.",
      normal: "Piyasa dengede, rutin işlemlerinizi aksatmayın.",
      yumuşak: "Hava güneşli! İşlem hacmini artırmak için doğru zaman.",
    },
  };

  return insights[role]?.[mood] || "Kovan için çalışmaya devam ediyorum!";
}
