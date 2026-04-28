import { BeeRole } from "@/contexts/UserContext";

export function getBeeInsight(role: BeeRole | string, mood: string): string {
  const isSert = mood === "sert";
  const isYumusak = mood === "yumuşak";

  switch (role) {
    case "İzci":
      if (isSert) return "Piyasa şu an çok seçici. Sadece en sağlam keşidecileri radarıma alıyorum, merak etme.";
      if (isYumusak) return "Partnerler şu an iştahlı! En hızlı dönüş yapacak faktoring şirketlerini senin için tarıyorum.";
      return "Standart piyasa taraması yapıyorum. Kovan için en dengeli partnerleri bulacağım.";

    case "Aracı":
      if (isSert) return "Pazarlık masası bugün biraz çetin. Ama merak etme, oranlarda ufak da olsa bir delik açacağım.";
      if (isYumusak) return "Bugün benim günüm! Partnerleri birbirine kırdırıp senin için en düşük komisyonu koparacağım.";
      return "Teklifleri aldım, revize turunda senin için en iyi şartları zorlamaya hazırım.";

    case "Kâtip":
      if (isSert) return "Hata kabul etmeyen bir gün. Çek bilgilerini iki kez kontrol ettim, her şey nizami.";
      if (isYumusak) return "İşler yoğunlaşabilir ama kayıtlarım her zaman tıkır tıkır işler. Sen sadece tekliflere odaklan.";
      return "Evrak arşivleme ve veri girişi bende. Çek DNA'sı tertemiz görünüyor.";

    case "Nabız":
      if (isSert) return "Veriler likidite daralmasına işaret ediyor. Bugün nakit akışını korumak önceliğimiz olmalı.";
      if (isYumusak) return "Piyasa şu an bayram havasında! Fırsat varken kovanı doldurmakta fayda var.";
      return "Piyasa normal seyrinde. 15 dakikalık otonom sürecimiz başarıyla devam ediyor.";

    default:
      return "Kovan için çalışmaya devam ediyorum!";
  }
}
