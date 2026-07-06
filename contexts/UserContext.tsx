import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MIN_DISCOUNT_RATE, MAX_DISCOUNT_RATE, XP_REWARDS, FLOWER_GROWTH_TIME_MS } from "@/constants/game";

/* =========================
   Types
========================= */

export interface Flower {
  id: string;
  plantedAt: number;
  ready: boolean;
  isGolden?: boolean;
}

export type MissionType = "analyze" | "harvest" | "spin" | "pulse" | "offer" | "revision" | "plant";

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
}

export type BeeRole = "İzci" | "Aracı" | "Kâtip" | "Nabız";

export interface BeeAgent {
  id: string;
  role: BeeRole;
  name: string;
  level: number;
  xp: number; // 0-100
  emoji: string;
}

export type CheckSource = "manual" | "erp" | "whatsapp";

export interface CheckItem {
  id: string;
  source: CheckSource;
  createdAt: number;

  checkNo: string;
  issuerName: string;
  bankName?: string;

  amount: number;
  currency: "TRY";
  dueDate: string; // YYYY-MM-DD
  issueDate?: string;

  imageUri?: string;

  dna: {
    fingerprint: string;
    seenBefore: boolean;
    duplicateOf?: string;
    tamperHint?: "none" | "suspicious";
  };

  issuerPulseScore: number; // 0-100

  invoice?: {
    invoiceNo: string;
    invoiceAmount?: number;
  };

  lane: "pilot-micro" | "standard";
}

export interface Coupon {
  id: string;
  title: string;
  kind: "discount" | "fee" | "priority";
  value: number;
  createdAt: number;
  used: boolean;
}

export interface Offer {
  id: string;
  partnerCode: string;
  createdAt: number;

  discountRate: number; // %
  fees: number; // TRY
  netPay: number; // TRY

  notes?: string;
}

export interface CompletedTransaction {
  id: string;
  check: CheckItem;
  selectedOffer: Offer;
  completedAt: number;
}

export interface OfferRequest {
  id: string;
  checkId: string;

  startedAt: number;
  deadlineAt: number;
  status: "collecting" | "ready" | "expired";

  revisionUsed: boolean;
  offers: Offer[];
}

export interface SpinPrize {
  prize: string;
  min: number;
  max: number;
  weight: number;
  bonus?: "flower" | "coupon" | "double";
}

export type PulseMode = "weather" | "band";

export interface UserSettings {
  pulseMode: PulseMode;
}

export interface User {
  companyName: string;
  phoneNumber: string;

  honeyPoints: number;
  level: number;

  spinCount: number;
  goldenSpinCount: number;
  lastSpinDate: string;
  lastPulseCheckDate?: string;

  flowers: Flower[];
  totalHarvested: number;
  purchasedItems: string[];

  // Pilot additions
  bees: BeeAgent[];
  checks: CheckItem[];
  offerRequests: OfferRequest[];
  completedTransactions: CompletedTransaction[];
  activities: { id: string; type: string; message: string; time: number }[];
  coupons: Coupon[];
  flowerSeeds: number;
  flowerBoosts: number;
  honeyBoosterUntil: number; // timestamp
  settings: UserSettings;

  missions: Mission[];
  lastMissionsDate: string;
}

export type ERPType = "tiger" | "mikro" | "netsis";

export interface DailyPulse {
  date: string; // YYYY-MM-DD
  mood: "sert" | "normal" | "yumupeak";
  band90: { min: number; max: number }; // %
  note: string;
}

/* =========================
   Defaults
========================= */

const DEFAULT_USER: Partial<User> = {
  honeyPoints: 150,
  level: 1,
  spinCount: 3,
  goldenSpinCount: 0,
  lastSpinDate: "",
  lastPulseCheckDate: "",
  flowers: [],
  totalHarvested: 0,
  purchasedItems: [],
  bees: [],
  checks: [],
  offerRequests: [],
  completedTransactions: [],
  coupons: [],
  flowerSeeds: 0,
  flowerBoosts: 0,
  honeyBoosterUntil: 0,
  settings: { pulseMode: "weather" },
  missions: [],
  lastMissionsDate: "",
};

const STORAGE_KEY = "@beeai_user";

const MISSION_POOL: Omit<Mission, "current" | "claimed">[] = [
  { id: "m_analyze", type: "analyze", title: "Evrak Uzmanı", description: "3 çek analizini tamamla.", target: 3, reward: 30 },
  { id: "m_harvest", type: "harvest", title: "Hasat Zamanı", description: "Bahçeden 5 çiçek topla.", target: 5, reward: 25 },
  { id: "m_spin", type: "spin", title: "Şanslı Gün", description: "Çarkı 2 kez çevir.", target: 2, reward: 15 },
  { id: "m_pulse", type: "pulse", title: "Piyasa Takibi", description: "Piyasa nabzını kontrol et.", target: 1, reward: 10 },
  { id: "m_offer", type: "offer", title: "Teklif Avcısı", description: "2 teklif kabul et.", target: 2, reward: 40 },
  { id: "m_revision", type: "revision", title: "Sıkı Pazarlık", description: "Bir teklif için revize iste.", target: 1, reward: 20 },
  { id: "m_plant", type: "plant", title: "Yeni Tohumlar", description: "Bahçeye 3 çiçek ek.", target: 3, reward: 15 },
  { id: "m_analyze_pro", type: "analyze", title: "Seri Analiz", description: "5 çek analizini tamamla.", target: 5, reward: 50 },
  { id: "m_harvest_pro", type: "harvest", title: "Büyük Hasat", description: "Bahçeden 10 çiçek topla.", target: 10, reward: 45 },
];

/* =========================
   Helpers
========================= */

function todayKey(): string {
  return new Date().toDateString();
}

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hashStringToInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function computeLevel(points: number): number {
  return Math.floor(points / 100) + 1;
}

function applyPointsGainInternal(user: User, amount: number): { updatedUser: User; pointsGained: number } {
  const isBoosted = user.honeyBoosterUntil > Date.now();
  const gain = isBoosted ? amount * 2 : amount;
  let currentPoints = user.honeyPoints + gain;
  let currentLevel = user.level;
  let currentGoldenSpins = user.goldenSpinCount || 0;
  let currentActivities = [...(user.activities || [])];

  // Level up logic
  while (currentPoints >= currentLevel * 100) {
    currentLevel += 1;
    // Level up reward: 50 Honey + 1 Golden Spin
    currentPoints += 50;
    currentGoldenSpins += 1;
    currentActivities = [
      {
        id: `act_lvl_${Date.now()}_${currentLevel}`,
        type: "level_up",
        message: `Tebrikler! Seviye ${currentLevel} oldunuz. 50 Bal ve 1 Altın Çeviri kazandınız!`,
        time: Date.now(),
      },
      ...currentActivities,
    ].slice(0, 10);
  }

  return {
    updatedUser: {
      ...user,
      honeyPoints: currentPoints,
      level: currentLevel,
      goldenSpinCount: currentGoldenSpins,
      activities: currentActivities,
    },
    pointsGained: gain,
  };
}

function addActivityInternal(user: User, type: string, message: string): User {
  const newActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    type,
    message,
    time: Date.now(),
  };
  return {
    ...user,
    activities: [newActivity, ...(user.activities || [])].slice(0, 10),
  };
}

function makeBeeAgents(): BeeAgent[] {
  const now = Date.now();
  return [
    { id: `bee_${now}_1`, role: "İzci", name: "İzci Arı", level: 1, xp: 15, emoji: "🕵️‍♂️" },
    { id: `bee_${now}_2`, role: "Aracı", name: "Müzakereci Arı", level: 1, xp: 20, emoji: "⚡" },
    { id: `bee_${now}_3`, role: "Kâtip", name: "Kâtip Arı", level: 1, xp: 10, emoji: "🧾" },
    { id: `bee_${now}_4`, role: "Nabız", name: "Nabız Arı", level: 1, xp: 18, emoji: "📊" },
  ];
}

function computeIssuerPulseScore(issuerName: string): number {
  const h = hashStringToInt(issuerName.trim().toLowerCase());
  // 35-95 bandı
  return 35 + (h % 61);
}

function computeFingerprint(checkNo: string, issuerName: string, amount: number, dueDate: string): string {
  return `${checkNo.trim().toUpperCase()}|${issuerName.trim().toLowerCase()}|${amount}|${dueDate}`;
}

function computeDailyPulseInternal(companyName?: string): DailyPulse {
  const dateISO = toISODate(new Date());
  const seedBase = `${dateISO}|${companyName || ""}`;
  const h = hashStringToInt(seedBase);

  // 90 gün bandı: 1.8 - 4.8 (pilot)
  const base = 1.8 + (h % 300) / 100; // 1.8-4.8
  const spread = 0.35 + ((h >>> 3) % 55) / 100; // 0.35-0.90
  const min = clamp(base - spread / 2, 1.2, 6.5);
  const max = clamp(base + spread / 2, 1.2, 6.5);

  let mood: DailyPulse["mood"] = "normal";
  if (base > 3.9) mood = "sert";
  if (base < 2.4) mood = "yumupeak";

  const note =
    mood === "sert"
      ? "Rekabet dar, teklif süreleri uzuyor. Keşideci skoru yüksek olanlar daha hızlı döner."
      : mood === "yumupeak"
      ? "Rekabet canlı, revize turu bugün iyi çalışır."
      : "Dengeli gün. Evrak eksiksizse 15 dakika hedefi rahat tutulur.";

  return {
    date: dateISO,
    mood,
    band90: { min: Number(min.toFixed(2)), max: Number(max.toFixed(2)) },
    note,
  };
}

function makePartnerCode(seed: number, idx: number): string {
  const n = (seed + idx * 97) % 40;
  return `Faktoring #${String(n + 1).padStart(2, "0")}`;
}

function computeOffers(check: CheckItem, pulse: DailyPulse, existingCount: number): Offer[] {
  const seed = hashStringToInt(check.dna.fingerprint) ^ hashStringToInt(pulse.date);
  const baseRate = (pulse.band90.min + pulse.band90.max) / 2;
  const laneAdjust = check.lane === "pilot-micro" ? -0.25 : 0.15;
  const sizeAdjust = check.amount > 500000 ? 0.12 : -0.05;

  const out: Offer[] = [];
  for (let i = 0; i < 3; i++) {
    if (i < existingCount) continue;
    const partnerCode = makePartnerCode(seed, i);
    const jitter = ((seed >>> (i + 2)) % 40) / 100; // 0-0.39
    const discountRate = clamp(baseRate + laneAdjust + sizeAdjust + jitter * (i === 0 ? 0.6 : 0.4), MIN_DISCOUNT_RATE, MAX_DISCOUNT_RATE);
    const fees = Math.round(clamp(check.amount * (0.002 + jitter / 200), 900, 6500));
    const netPay = Math.round(check.amount * (1 - discountRate / 100) - fees);

    out.push({
      id: `offer_${check.id}_${Date.now()}_${i}`,
      partnerCode,
      createdAt: Date.now(),
      discountRate: Number(discountRate.toFixed(2)),
      fees,
      netPay,
      notes: i === 0 ? "Hızlı dönüş (pilot)" : i === 1 ? "Standart paket" : "Revizeye açık",
    });
  }
  return out;
}

function parseCsvLike(text: string): Record<string, string>[] {
  const raw = text.trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));
    rows.push(obj);
  }
  return rows;
}

/* =========================
   Context
========================= */

interface UserContextValue {
  user: User | null;
  isLoading: boolean;

  login: (companyName: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;

  addHoney: (amount: number) => Promise<void>;
  spendHoney: (amount: number) => Promise<boolean>;
  spin: () => Promise<{ pointsWon: number; prize: string } | null>;

  plantFlower: () => Promise<boolean>;
  harvestFlower: (flowerId: string) => Promise<number>;
  harvestAllFlowers: () => Promise<number>;
  boostFlower: (flowerId: string) => Promise<boolean>;
  checkDailySpins: () => Promise<void>;
  checkDailyMissions: () => Promise<void>;
  claimMissionReward: (missionId: string) => Promise<void>;

  // Pilot: checks & offers
  addCheck: (input: {
    checkNo: string;
    issuerName: string;
    amount: number;
    dueDate: string;
    bankName?: string;
    imageUri?: string;
    source?: CheckSource;
  }) => Promise<string | null>;
  linkInvoice: (checkId: string, invoiceNo: string, invoiceAmount?: number) => Promise<void>;
  importSampleERP: (erp: ERPType) => Promise<number>;
  importFromCsv: (csvText: string, erpHint?: ERPType) => Promise<number>;

  startOfferCollection: (checkId: string) => Promise<void>;
  ensureOfferProgress: (checkId: string) => Promise<void>;
  requestRevision: (checkId: string) => Promise<boolean>;
  pickOffer: (checkId: string, offerId: string, couponId?: string) => Promise<void>;

  // Pilot: pulse
  getDailyPulse: () => DailyPulse;
  setPulseMode: (mode: PulseMode) => Promise<void>;
  awardBeeXP: (role: BeeRole, xp: number) => Promise<void>;
  checkPulseXP: () => Promise<boolean>;
  applyPointsGain: (amount: number) => Promise<number>;
  addActivity: (type: string, message: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        const hydrated: User = {
          ...(DEFAULT_USER as User),
          ...parsed,
          settings: { ...(DEFAULT_USER.settings as UserSettings), ...(parsed.settings || {}) },
          bees: parsed.bees && parsed.bees.length ? parsed.bees : makeBeeAgents(),
          checks: parsed.checks || [],
          offerRequests: parsed.offerRequests || [],
          completedTransactions: parsed.completedTransactions || [],
          activities: parsed.activities || [],
          coupons: parsed.coupons || [],
          flowerSeeds: parsed.flowerSeeds || 0,
          flowerBoosts: parsed.flowerBoosts || 0,
          honeyBoosterUntil: parsed.honeyBoosterUntil || ((parsed as any).doubleNextHoney ? Date.now() + 600000 : 0),
          missions: parsed.missions || [],
          lastMissionsDate: parsed.lastMissionsDate || "",
        };
        hydrated.level = computeLevel(hydrated.honeyPoints);
        setUser(hydrated);
      }
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (u: User) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (companyName: string, phoneNumber: string) => {
    const newUser: User = {
      ...(DEFAULT_USER as User),
      companyName,
      phoneNumber,
      bees: makeBeeAgents(),
      checks: [],
      offerRequests: [],
      completedTransactions: [],
      activities: [],
      coupons: [],
      flowerSeeds: 1,
      flowerBoosts: 0,
      honeyBoosterUntil: 0,
      settings: { pulseMode: "weather" },
      missions: [],
      lastMissionsDate: "",
    };
    newUser.level = computeLevel(newUser.honeyPoints);
    await saveUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated: User = { ...user, ...updates };
    updated.level = computeLevel(updated.honeyPoints);
    await saveUser(updated);
  };

  const applyPointsGain = async (amount: number): Promise<number> => {
    if (!user) return 0;
    const { updatedUser, pointsGained } = applyPointsGainInternal(user, amount);
    await saveUser(updatedUser);
    return pointsGained;
  };

  const addActivity = async (type: string, message: string) => {
    if (!user) return;
    const updated = addActivityInternal(user, type, message);
    await saveUser(updated);
  };

  const addHoney = async (amount: number) => {
    await applyPointsGain(amount);
  };

  const spendHoney = async (amount: number): Promise<boolean> => {
    if (!user || user.honeyPoints < amount) return false;
    const newPoints = user.honeyPoints - amount;
    await saveUser({ ...user, honeyPoints: newPoints, level: computeLevel(newPoints) });
    return true;
  };

  const checkDailySpins = async () => {
    if (!user) return;
    const today = todayKey();
    if (user.lastSpinDate !== today) {
      await saveUser({ ...user, spinCount: user.spinCount + 3, lastSpinDate: today });
    }
  };

  const checkDailyMissions = async () => {
    if (!user) return;
    const today = todayKey();
    if (user.lastMissionsDate === today && user.missions.length > 0) return;

    // Shuffle and pick 4
    const shuffled = [...MISSION_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    const newMissions: Mission[] = selected.map((m) => ({
      ...m,
      current: 0,
      claimed: false,
    }));

    await saveUser({ ...user, missions: newMissions, lastMissionsDate: today });
  };

  const claimMissionReward = async (missionId: string) => {
    if (!user) return;
    const mIdx = user.missions.findIndex((m) => m.id === missionId);
    if (mIdx < 0) return;

    const mission = user.missions[mIdx];
    if (mission.claimed || mission.current < mission.target) return;

    const updatedMissions = [...user.missions];
    updatedMissions[mIdx] = { ...mission, claimed: true };

    const { updatedUser } = applyPointsGainInternal({ ...user, missions: updatedMissions }, mission.reward);
    await saveUser(updatedUser);
  };

  const spin = async (): Promise<{ pointsWon: number; prize: string } | null> => {
    if (!user) return null;
    const hasGolden = (user.goldenSpinCount || 0) > 0;
    if (user.spinCount <= 0 && !hasGolden) return null;

    const prizes: SpinPrize[] = [
      { prize: "10-50 Bal", min: 10, max: 50, weight: 40 },
      { prize: "Çiçek Tohumu", min: 0, max: 0, weight: 20, bonus: "flower" },
      { prize: "Kupon %5", min: 0, max: 0, weight: 15, bonus: "coupon" },
      { prize: "2x Bal", min: 0, max: 0, weight: 15, bonus: "double" },
      { prize: "BÜYÜK İKRAMİYE", min: 200, max: 500, weight: hasGolden ? 15 : 5 },
      { prize: "5-25 Bal", min: 5, max: 25, weight: 5 },
    ];

    const total = prizes.reduce((acc, p) => acc + p.weight, 0);
    let rand = Math.random() * total;
    let selected = prizes[0];
    for (const p of prizes) {
      if (rand < p.weight) {
        selected = p;
        break;
      }
      rand -= p.weight;
    }

    let pointsWon = 0;
    if (selected.min > 0) {
      pointsWon = Math.floor(Math.random() * (selected.max - selected.min + 1)) + selected.min;
    }

    const today = todayKey();
    let updated: User = { ...user, lastSpinDate: today };

    if (hasGolden) {
      updated.goldenSpinCount = Math.max(0, (updated.goldenSpinCount || 0) - 1);
    } else {
      updated.spinCount = Math.max(0, updated.spinCount - 1);
    }

    const updatedMissions = (updated.missions || []).map(m => {
      if (m.type === "spin") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });
    updated = { ...updated, missions: updatedMissions };

    if (selected.bonus === "flower") {
      updated = { ...updated, flowerSeeds: (updated.flowerSeeds || 0) + 1 };
    } else if (selected.bonus === "coupon") {
      const c: Coupon = {
        id: `coupon_${Date.now()}`,
        title: "Pilot Kupon %5",
        kind: "discount",
        value: 5,
        createdAt: Date.now(),
        used: false,
      };
      updated = { ...updated, coupons: [c, ...(updated.coupons || [])] };
    } else if (selected.bonus === "double") {
      updated = { ...updated, honeyBoosterUntil: Date.now() + 15 * 60 * 1000 };
    } else if (pointsWon > 0) {
      const { updatedUser } = applyPointsGainInternal(updated, pointsWon);
      updated = updatedUser;
    }

    await saveUser(updated);
    return { pointsWon: pointsWon, prize: selected.prize };
  };

  const plantFlower = async (): Promise<boolean> => {
    if (!user) return false;

    const useSeed = (user.flowerSeeds || 0) > 0;
    if (!useSeed && user.honeyPoints < 10) return false;

    const isGolden = Math.random() < 0.15;
    const newFlower: Flower = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      plantedAt: Date.now(),
      ready: false,
      isGolden,
    };

    const newFlowers = [...(user.flowers || []), newFlower];

    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "plant") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });

    let updated: User = { ...user, flowers: newFlowers, missions: updatedMissions };
    if (useSeed) {
      updated = { ...updated, flowerSeeds: Math.max(0, (updated.flowerSeeds || 0) - 1) };
    } else {
      const newPoints = updated.honeyPoints - 10;
      updated = { ...updated, honeyPoints: newPoints, level: computeLevel(newPoints) };
    }

    await saveUser(updated);
    return true;
  };

  const harvestFlower = async (flowerId: string): Promise<number> => {
    if (!user) return 0;

    const flower = (user.flowers || []).find((f) => f.id === flowerId);
    if (!flower) return 0;

    const elapsed = Date.now() - flower.plantedAt;
    const isReady = elapsed >= FLOWER_GROWTH_TIME_MS;
    if (!isReady) return 0;

    let honeyEarnedRaw = Math.floor(Math.random() * 16) + 15;
    if (flower.isGolden) honeyEarnedRaw *= 2;

    const newFlowers = (user.flowers || []).filter((f) => f.id !== flowerId);
    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "harvest") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });

    const { updatedUser, pointsGained } = applyPointsGainInternal({
      ...user,
      flowers: newFlowers,
      totalHarvested: (user.totalHarvested || 0) + 1,
      missions: updatedMissions,
    }, honeyEarnedRaw);

    await saveUser(updatedUser);
    return pointsGained;
  };

  const harvestAllFlowers = async (): Promise<number> => {
    if (!user) return 0;

    const readyFlowers = (user.flowers || []).filter(
      (f) => Date.now() - f.plantedAt >= FLOWER_GROWTH_TIME_MS
    );
    if (readyFlowers.length === 0) return 0;

    let totalEarnedRaw = 0;
    readyFlowers.forEach((f) => {
      let earned = Math.floor(Math.random() * 16) + 15;
      if (f.isGolden) earned *= 2;
      totalEarnedRaw += earned;
    });

    const readyIds = readyFlowers.map((f) => f.id);
    const remainingFlowers = (user.flowers || []).filter((f) => !readyIds.includes(f.id));

    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "harvest") return { ...m, current: Math.min(m.target, m.current + readyFlowers.length) };
      return m;
    });

    const { updatedUser, pointsGained } = applyPointsGainInternal({
      ...user,
      flowers: remainingFlowers,
      totalHarvested: (user.totalHarvested || 0) + readyFlowers.length,
      missions: updatedMissions,
    }, totalEarnedRaw);

    await saveUser(updatedUser);
    return pointsGained;
  };

  const boostFlower = async (flowerId: string): Promise<boolean> => {
    if (!user || (user.flowerBoosts || 0) <= 0) return false;

    const flowerIdx = (user.flowers || []).findIndex((f) => f.id === flowerId);
    if (flowerIdx < 0) return false;

    const flower = user.flowers[flowerIdx];
    if (Date.now() - flower.plantedAt >= FLOWER_GROWTH_TIME_MS) return false;

    const updatedFlower = { ...flower, plantedAt: Date.now() - FLOWER_GROWTH_TIME_MS - 1000 };
    const newFlowers = [...user.flowers];
    newFlowers[flowerIdx] = updatedFlower;

    await saveUser({
      ...user,
      flowers: newFlowers,
      flowerBoosts: user.flowerBoosts - 1,
    });
    return true;
  };

  const addCheck: UserContextValue["addCheck"] = async (input) => {
    if (!user) return null;

    const amount = Number(input.amount);
    if (!input.checkNo?.trim() || !input.issuerName?.trim() || !input.dueDate?.trim() || !Number.isFinite(amount)) return null;

    const fingerprint = computeFingerprint(input.checkNo, input.issuerName, amount, input.dueDate);
    const existing = (user.checks || []).find((c) => c.dna?.fingerprint === fingerprint);

    const lane: CheckItem["lane"] = amount <= 250000 ? "pilot-micro" : "standard";
    const id = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const check: CheckItem = {
      id,
      source: input.source || "manual",
      createdAt: Date.now(),
      checkNo: input.checkNo.trim(),
      issuerName: input.issuerName.trim(),
      bankName: input.bankName?.trim(),
      amount,
      currency: "TRY",
      dueDate: input.dueDate,
      imageUri: input.imageUri,
      dna: {
        fingerprint,
        seenBefore: !!existing,
        duplicateOf: existing?.id,
        tamperHint: "none",
      },
      issuerPulseScore: computeIssuerPulseScore(input.issuerName),
      lane,
    };

    const bees = (user.bees || []).map(b => {
      if (b.role === "Kâtip") {
        let newXp = b.xp + XP_REWARDS.CHECK_ADDED;
        let newLevel = b.level;
        if (newXp >= 100) { newXp -= 100; newLevel += 1; }
        return { ...b, xp: newXp, level: newLevel };
      }
      return b;
    });

    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "analyze") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });

    const clerk = bees.find(b => b.role === "Kâtip");
    const bonusHoney = clerk ? 5 + (clerk.level - 1) * 2 : 0;

    const { updatedUser } = applyPointsGainInternal({
      ...user,
      bees,
      checks: [check, ...(user.checks || [])],
      missions: updatedMissions,
    }, bonusHoney);

    const updatedWithActivity = addActivityInternal(
      updatedUser,
      "check_add",
      `${check.issuerName} firmasına ait çek eklendi.${bonusHoney > 0 ? ` Kâtip bonusu: ${bonusHoney} bal.` : ""}`
    );

    await saveUser(updatedWithActivity);
    return id;
  };

  const linkInvoice: UserContextValue["linkInvoice"] = async (checkId, invoiceNo, invoiceAmount) => {
    if (!user) return;
    const checks = (user.checks || []).map((c) =>
      c.id === checkId ? { ...c, invoice: { invoiceNo, invoiceAmount } } : c
    );
    await saveUser({ ...user, checks });
  };

  const importSampleERP: UserContextValue["importSampleERP"] = async (erp) => {
    if (!user) return 0;

    const baseDate = new Date();
    const d60 = new Date(baseDate.getTime() + 60 * 24 * 3600 * 1000);
    const d90 = new Date(baseDate.getTime() + 90 * 24 * 3600 * 1000);
    const d120 = new Date(baseDate.getTime() + 120 * 24 * 3600 * 1000);

    const prefix = erp.toUpperCase();
    const samples = [
      { checkNo: `${prefix}-CHK-000128`, issuerName: "Arıkan İnşaat Ltd.", bankName: "İş Bankası", amount: 420000, dueDate: toISODate(d90) },
      { checkNo: `${prefix}-CHK-000129`, issuerName: "Kovan Tekstil A.Ş.", bankName: "Garanti BBVA", amount: 185000, dueDate: toISODate(d60) },
      { checkNo: `${prefix}-CHK-000130`, issuerName: "Bereket Gıda Sanayi", bankName: "Yapı Kredi", amount: 760000, dueDate: toISODate(d120) },
    ];

    const existing = user.checks || [];
    const newChecks: CheckItem[] = [];

    for (const s of samples) {
      const fp = computeFingerprint(s.checkNo, s.issuerName, s.amount, s.dueDate);
      const dup = [...newChecks, ...existing].find((c) => c.dna?.fingerprint === fp);

      const lane: CheckItem["lane"] = s.amount <= 250000 ? "pilot-micro" : "standard";
      const id = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      newChecks.push({
        id,
        source: "erp",
        createdAt: Date.now(),
        checkNo: s.checkNo,
        issuerName: s.issuerName,
        bankName: s.bankName,
        amount: s.amount,
        currency: "TRY",
        dueDate: s.dueDate,
        dna: { fingerprint: fp, seenBefore: !!dup, duplicateOf: dup?.id, tamperHint: "none" },
        issuerPulseScore: computeIssuerPulseScore(s.issuerName),
        lane,
      });
    }

    const updated: User = { ...user, checks: [...newChecks.reverse(), ...existing] };
    await saveUser(updated);
    return newChecks.length;
  };

  const importFromCsv: UserContextValue["importFromCsv"] = async (csvText, erpHint) => {
    if (!user) return 0;
    const rows = parseCsvLike(csvText);
    if (!rows.length) return 0;

    const existing = user.checks || [];
    const newChecks: CheckItem[] = [];

    for (const r of rows) {
      const checkNo = r["checkno"] || r["çekno"] || r["cekno"] || r["no"] || "";
      const issuerName = r["issuer"] || r["keşideci"] || r["kesideci"] || r["firma"] || "";
      const amountStr = r["amount"] || r["tutar"] || "";
      const dueDate = r["duedate"] || r["vade"] || "";
      const bankName = r["bank"] || r["banka"] || "";

      const amount = Number(String(amountStr).replace(/\./g, "").replace(",", "."));
      if (!checkNo || !issuerName || !dueDate || !Number.isFinite(amount)) continue;

      const fp = computeFingerprint(checkNo, issuerName, amount, dueDate);
      const dup = [...newChecks, ...existing].find((c) => c.dna?.fingerprint === fp);

      const lane: CheckItem["lane"] = amount <= 250000 ? "pilot-micro" : "standard";
      const id = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      newChecks.push({
        id,
        source: "erp",
        createdAt: Date.now(),
        checkNo: String(checkNo).trim(),
        issuerName: String(issuerName).trim(),
        bankName: String(bankName || "").trim(),
        amount,
        currency: "TRY",
        dueDate: String(dueDate).trim(),
        dna: { fingerprint: fp, seenBefore: !!dup, duplicateOf: dup?.id, tamperHint: "none" },
        issuerPulseScore: computeIssuerPulseScore(String(issuerName)),
        lane,
      });
    }

    const updated: User = { ...user, checks: [...newChecks.reverse(), ...existing] };
    await saveUser(updated);
    return newChecks.length;
  };

  const startOfferCollection: UserContextValue["startOfferCollection"] = async (checkId) => {
    if (!user) return;

    const exists = (user.offerRequests || []).find((r) => r.checkId === checkId);
    if (exists) return;

    const startedAt = Date.now();
    const deadlineAt = startedAt + 15 * 60 * 1000;

    const req: OfferRequest = {
      id: `req_${startedAt}_${Math.random().toString(36).slice(2, 8)}`,
      checkId,
      startedAt,
      deadlineAt,
      status: "collecting",
      revisionUsed: false,
      offers: [],
    };

    const updatedWithActivity = addActivityInternal({
      ...user,
      offerRequests: [req, ...(user.offerRequests || [])],
    }, "offer_start", "15 dakikalık teklif toplama süreci başlatıldı.");

    await saveUser(updatedWithActivity);
  };

  const ensureOfferProgress: UserContextValue["ensureOfferProgress"] = async (checkId) => {
    if (!user) return;

    const reqIdx = (user.offerRequests || []).findIndex((r) => r.checkId === checkId);
    if (reqIdx < 0) return;

    const req = user.offerRequests[reqIdx];
    const check = (user.checks || []).find((c) => c.id === checkId);
    if (!check) return;

    const now = Date.now();
    const scout = (user.bees || []).find(b => b.role === "İzci");
    // İzci bonus: Her seviye %10 hız (max %50). Örn: Sv 2 = %10 hızlanma -> zaman çarpanı 0.9
    const speedBonus = scout ? Math.min(0.5, (scout.level - 1) * 0.1) : 0;
    const timeMultiplier = 1 - speedBonus;

    const elapsed = now - req.startedAt;

    // Pilot hızlandırılmış (İzci bonusu dahil): teklifler normalde 15s, 45s, 90s
    const t1 = 15000 * timeMultiplier;
    const t2 = 45000 * timeMultiplier;
    const t3 = 90000 * timeMultiplier;

    const targetCount = elapsed >= t3 ? 3 : elapsed >= t2 ? 2 : elapsed >= t1 ? 1 : 0;

    if (targetCount <= req.offers.length && now <= req.deadlineAt && req.status === "collecting") {
      return; // No new offers and not expired yet
    }

    const pulse = computeDailyPulseInternal(user.companyName);
    const newOffers = targetCount > req.offers.length ? computeOffers(check, pulse, req.offers.length) : [];

    let status: OfferRequest["status"] = req.status;
    if (now > req.deadlineAt && req.offers.length < 3) status = "expired";
    if (req.offers.length + newOffers.length >= 3) status = "ready";
    if (status === "expired" && req.offers.length > 0) status = "ready";

    if (newOffers.length === 0 && status === req.status) {
      return; // Final safety check: nothing actually changed
    }

    const updatedReq: OfferRequest = {
      ...req,
      offers: [...req.offers, ...newOffers].slice(0, 3),
      status,
    };

    const updatedRequests = [...user.offerRequests];
    updatedRequests[reqIdx] = updatedReq;
    await saveUser({ ...user, offerRequests: updatedRequests });
  };

  const requestRevision: UserContextValue["requestRevision"] = async (checkId) => {
    if (!user) return false;

    const idx = (user.offerRequests || []).findIndex((r) => r.checkId === checkId);
    if (idx < 0) return false;

    const req = user.offerRequests[idx];
    if (req.revisionUsed) return false;

    const check = (user.checks || []).find((c) => c.id === checkId);
    if (!check) return false;

    const negotiator = (user.bees || []).find(b => b.role === "Aracı");
    const bonusMultiplier = negotiator ? 1 + (negotiator.level - 1) * 0.1 : 1;

    // Revize: tüm teklifleri küçük iyileştir (oran -0.15, fee -150)
    const revised = req.offers.map((o) => {
      const discountRate = clamp(o.discountRate - (0.15 * bonusMultiplier), MIN_DISCOUNT_RATE, MAX_DISCOUNT_RATE);
      const fees = Math.max(0, o.fees - Math.round(150 * bonusMultiplier));
      const netPay = Math.round(check.amount * (1 - discountRate / 100) - fees);
      return { ...o, discountRate: Number(discountRate.toFixed(2)), fees, netPay, notes: "Revize turu" };
    });

    const updatedBees = (user.bees || []).map(b => {
      if (b.role === "Aracı") {
        let newXp = b.xp + XP_REWARDS.REVISION;
        let newLevel = b.level;
        if (newXp >= 100) { newXp -= 100; newLevel += 1; }
        return { ...b, xp: newXp, level: newLevel };
      }
      return b;
    });

    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "revision") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });

    const updatedReq: OfferRequest = { ...req, revisionUsed: true, offers: revised, status: "ready" };
    const updatedRequests = [...user.offerRequests];
    updatedRequests[idx] = updatedReq;

    const updatedWithActivity = addActivityInternal({
      ...user,
      bees: updatedBees,
      offerRequests: updatedRequests,
      missions: updatedMissions,
    }, "revision", "Teklifler için revize talebi iletildi.");

    await saveUser(updatedWithActivity);
    return true;
  };

  const pickOffer: UserContextValue["pickOffer"] = async (checkId, offerId, couponId) => {
    if (!user) return;
    const req = (user.offerRequests || []).find((r) => r.checkId === checkId);
    if (!req) return;

    let offer = req.offers.find((o) => o.id === offerId);
    if (!offer) return;

    const check = (user.checks || []).find((c) => c.id === checkId);
    if (!check) return;

    let updatedCoupons = user.coupons || [];
    if (couponId) {
      const coupon = updatedCoupons.find(c => c.id === couponId && !c.used);
      if (coupon) {
        // Apply coupon
        if (coupon.kind === 'discount') {
          const cost = check.amount - offer.netPay;
          const saving = Math.round(cost * (coupon.value / 100));
          offer = { ...offer, netPay: offer.netPay + saving, notes: (offer.notes ? offer.notes + " + " : "") + `%${coupon.value} Kupon` };
        } else if (coupon.kind === 'fee') {
          offer = { ...offer, netPay: offer.netPay + coupon.value, notes: (offer.notes ? offer.notes + " + " : "") + `₺${coupon.value} Bonus` };
        }
        updatedCoupons = updatedCoupons.map(c => c.id === couponId ? { ...c, used: true } : c);
      }
    }

    const completed: CompletedTransaction = {
      id: `tx_${Date.now()}`,
      check,
      selectedOffer: offer,
      completedAt: Date.now(),
    };

    const updatedRequests = (user.offerRequests || []).filter((r) => r.checkId !== checkId);
    const updatedChecks = (user.checks || []).filter((c) => c.id !== checkId);

    const updatedBees = (user.bees || []).map(b => {
      if (b.role === "Aracı" || b.role === "İzci") {
        let newXp = b.xp + XP_REWARDS.OFFER_PICKED;
        let newLevel = b.level;
        if (newXp >= 100) { newXp -= 100; newLevel += 1; }
        return { ...b, xp: newXp, level: newLevel };
      }
      return b;
    });

    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "offer") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });

    const updatedWithActivity = addActivityInternal({
      ...user,
      bees: updatedBees,
      checks: updatedChecks,
      offerRequests: updatedRequests,
      coupons: updatedCoupons,
      missions: updatedMissions,
      completedTransactions: [completed, ...(user.completedTransactions || [])],
    }, "pick_offer", `${offer.partnerCode} teklifi seçildi, işlem tamamlanıyor.`);

    await saveUser(updatedWithActivity);
  };

  const getDailyPulse = (): DailyPulse => {
    return computeDailyPulseInternal(user?.companyName);
  };

  const setPulseMode: UserContextValue["setPulseMode"] = async (mode) => {
    if (!user) return;
    await saveUser({ ...user, settings: { ...(user.settings || { pulseMode: "weather" }), pulseMode: mode } });
  };

  const awardBeeXP: UserContextValue["awardBeeXP"] = async (role, xp) => {
    if (!user) return;
    const bees = (user.bees || []).map((b) => {
      if (b.role === role) {
        let newXp = b.xp + xp;
        let newLevel = b.level;
        if (newXp >= 100) {
          newXp -= 100;
          newLevel += 1;
        }
        return { ...b, xp: newXp, level: newLevel };
      }
      return b;
    });
    await saveUser({ ...user, bees });
  };

  const checkPulseXP = async (): Promise<boolean> => {
    if (!user) return false;
    const today = todayKey();
    if (user.lastPulseCheckDate === today) return false;

    const bees = (user.bees || []).map((b) => {
      if (b.role === "Nabız") {
        let newXp = b.xp + XP_REWARDS.PULSE_CHECKED;
        let newLevel = b.level;
        if (newXp >= 100) {
          newXp -= 100;
          newLevel += 1;
        }
        return { ...b, xp: newXp, level: newLevel };
      }
      return b;
    });

    const pulseBee = bees.find(b => b.role === "Nabız");
    const bonusHoney = pulseBee ? 5 + (pulseBee.level - 1) * 3 : 0;

    const updatedMissions = (user.missions || []).map(m => {
      if (m.type === "pulse") return { ...m, current: Math.min(m.target, m.current + 1) };
      return m;
    });

    const { updatedUser } = applyPointsGainInternal({
      ...user,
      bees,
      lastPulseCheckDate: today,
      missions: updatedMissions,
    }, bonusHoney);

    await saveUser(updatedUser);
    return true;
  };

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      updateUser,
      addHoney,
      spendHoney,
      spin,
      plantFlower,
      harvestFlower,
      harvestAllFlowers,
      boostFlower,
      checkDailySpins,
      checkDailyMissions,
      claimMissionReward,
      addCheck,
      linkInvoice,
      importSampleERP,
      importFromCsv,
      startOfferCollection,
      ensureOfferProgress,
      requestRevision,
      pickOffer,
      getDailyPulse,
      setPulseMode,
      awardBeeXP,
      checkPulseXP,
    }),
    [user, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
