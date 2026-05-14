import { BeeRole, DailyPulse } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole, mood: DailyPulse["mood"]): string {
  const insights: Record<BeeRole, Record<DailyPulse["mood"], string>> = {
    İzci: {
      sert: "Piyasa durgun, ancak sağlam firmaların çekleri hala değerli. Seçici olmalıyız.",
      normal: "Yeni fırsatlar için etrafa bakınıyorum. Bugün birkaç iyi çek yakalayabiliriz.",
      yumuşak: "Piyasa çok canlı! Her yerden çek akıyor, en iyilerini seçmek için harika bir zaman.",
    },
    Aracı: {
      sert: "Faktoring şirketleri bugünlerde çok sıkı. Revize almak zor olabilir ama deneyeceğiz.",
      normal: "Teklifler makul görünüyor. Küçük bir dokunuşla oranları daha da iyileştirebilirim.",
      yumuşak: "Rekabet kızışmış durumda! Bugün faktoringleri birbirine düşürüp en iyi oranı koparabiliriz.",
    },
    Kâtip: {
      sert: "Hata payımız yok. Evrakların eksiksiz olması bugün her zamankinden daha kritik.",
      normal: "Kayıtlar güncel, veriler net. Çekleri hızlıca sisteme işlemeye hazırım.",
      yumuşak: "İş yükü artıyor! Ama merak etme, tüm çekleri ve faturaları titizlikle takip ediyorum.",
    },
    Nabız: {
      sert: "Piyasa rüzgarı karşıdan esiyor. Nakit akışını korumak için yüksek skorlu çeklere odaklanın.",
      normal: "Hava bugün parçalı bulutlu. İşlemleri standart hızında yürütebiliriz.",
      yumuşak: "Bugün bahar havası var! Hızlı işlem ve düşük komisyon için en doğru gün.",
    },
  };

  return insights[role][mood] || "Gözlerim piyasanın üzerinde, her şey kontrol altında!";
}
