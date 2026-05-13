import { BeeRole } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: "sert" | "normal" | "yumuşak"): string {
  const insights: Record<BeeRole, Record<string, string>> = {
    İzci: {
      sert: "Piyasa sertleşti, keşideci skoru 70'in altındaki çeklere karşı temkinli olmalıyız.",
      normal: "İyi bir gün, yeni çek analizleri için verileri taramaya devam ediyorum.",
      yumuşak: "Fırsatlar artıyor! Portföydeki tüm çekleri bugün işleme alabiliriz.",
    },
    Aracı: {
      sert: "Faizler yüksek, ancak güçlü pazarlıkla %0.15 daha iyi oran koparabilirim.",
      normal: "Teklifler dengeli geliyor, revize turlarını kullanarak optimizasyon yapalım.",
      yumuşak: "Piyasa çok iştahlı, revize taleplerimiz bugün havada kapılacaktır.",
    },
    Kâtip: {
      sert: "Evrakların eksiksiz olması kritik, hata payını sıfıra indirmeliyiz.",
      normal: "Kayıtları güncel tutuyorum, her işlem ortalama 12 dakikada tamamlanıyor.",
      yumuşak: "Hızlı girişler yapıyoruz, işlem hızımız bugün rekor kırabilir.",
    },
    Nabız: {
      sert: "Piyasa daralıyor, nakit akışını korumak için hızlı döngülere odaklanmalısın.",
      normal: "Sektörel trendler kararlı seyrediyor, büyük bir dalgalanma beklemiyorum.",
      yumuşak: "Likidite bolluğu var, genişleme ve yatırım için uygun bir zemin oluştu.",
    },
  };

  return insights[role]?.[mood] || "Kovan için çalışmaya devam ediyorum!";
}
