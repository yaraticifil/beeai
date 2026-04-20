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
  lastSpinDate: string;

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
  doubleNextHoney: boolean;
  settings: UserSettings;
}

export type ERPType = "tiger" | "mikro" | "netsis";

export interface DailyPulse {
  date: string; // YYYY-MM-DD
  mood: "sert" | "normal" | "yumuşak";
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
  lastSpinDate: "",
  flowers: [],
  totalHarvested: 0,
  purchasedItems: [],
  bees: [],
  checks: [],
  offerRequests: [],
  completedTransactions: [],
  coupons: [],
  flowerSeeds: 0,
  doubleNextHoney: false,
  settings: { pulseMode: "weather" },
};

const STORAGE_KEY = "@beeai_user";

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
  if (base < 2.4) mood = "yumuşak";

  const note =
    mood === "sert"
      ? "Rekabet dar, teklif süreleri uzuyor. Keşideci skoru yüksek olanlar daha hızlı döner."
      : mood === "yumuşak"
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
  checkDailySpins: () => Promise<void>;

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
  pickOffer: (checkId: string, offerId: string) => Promise<void>;

  // Pilot: pulse
  getDailyPulse: () => DailyPulse;
  setPulseMode: (mode: PulseMode) => Promise<void>;
  awardBeeXP: (role: BeeRole, xp: number) => Promise<void>;
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
          doubleNextHoney: parsed.doubleNextHoney || false,
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
      doubleNextHoney: false,
      settings: { pulseMode: "weather" },
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

  const addHoney = async (amount: number) => {
    if (!user) return;

    const gain = user.doubleNextHoney ? amount * 2 : amount;
    const newPoints = user.honeyPoints + gain;

    const updated: User = {
      ...user,
      honeyPoints: newPoints,
      level: computeLevel(newPoints),
      doubleNextHoney: false,
    };
    await saveUser(updated);
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
      await saveUser({ ...user, spinCount: 3, lastSpinDate: today });
    }
  };

  const spin = async (): Promise<{ pointsWon: number; prize: string } | null> => {
    if (!user || user.spinCount <= 0) return null;

    const prizes = [
      { prize: "10-50 Bal", min: 10, max: 50, weight: 40 },
      { prize: "Çiçek Tohumu", min: 0, max: 0, weight: 20, bonus: "flower" as const },
      { prize: "Kupon %5", min: 0, max: 0, weight: 15, bonus: "coupon" as const },
      { prize: "2x Bal", min: 0, max: 0, weight: 15, bonus: "double" as const },
      { prize: "BÜYÜK İKRAMİYE", min: 200, max: 500, weight: 5 },
      { prize: "5-25 Bal", min: 5, max: 25, weight: 5 },
    ];

    const total = prizes.reduce((acc, p) => acc + p.weight, 0);
    let rand = Math.random() * total;
    let selected = prizes[0];
    for (const p of prizes) {
      if (rand < p.weight) { selected = p; break; }
      rand -= p.weight;
    }

    let pointsWon = 0;
    if (selected.min > 0) {
      pointsWon = Math.floor(Math.random() * (selected.max - selected.min + 1)) + selected.min;
    }

    const today = todayKey();
    const newSpinCount = user.spinCount - 1;

    let updated: User = { ...user, spinCount: newSpinCount, lastSpinDate: today };

    if ((selected as any).bonus === "flower") {
      updated = { ...updated, flowerSeeds: (updated.flowerSeeds || 0) + 1 };
    } else if ((selected as any).bonus === "coupon") {
      const c: Coupon = {
        id: `coupon_${Date.now()}`,
        title: "Pilot Kupon %5",
        kind: "discount",
        value: 5,
        createdAt: Date.now(),
        used: false,
      };
      updated = { ...updated, coupons: [c, ...(updated.coupons || [])] };
    } else if ((selected as any).bonus === "double") {
      updated = { ...updated, doubleNextHoney: true };
    } else if (pointsWon > 0) {
      const gain = updated.doubleNextHoney ? pointsWon * 2 : pointsWon;
      const newPoints = updated.honeyPoints + gain;
      updated = { ...updated, honeyPoints: newPoints, level: computeLevel(newPoints), doubleNextHoney: false };
    }

    await saveUser(updated);
    return { pointsWon: pointsWon, prize: selected.prize };
  };

  const plantFlower = async (): Promise<boolean> => {
    if (!user) return false;

    const useSeed = (user.flowerSeeds || 0) > 0;
    if (!useSeed && user.honeyPoints < 10) return false;

    const newFlower: Flower = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      plantedAt: Date.now(),
      ready: false,
    };

    const newFlowers = [...(user.flowers || []), newFlower];

    let updated: User = { ...user, flowers: newFlowers };
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

    const honeyEarned = Math.floor(Math.random() * 16) + 15;
    const newFlowers = (user.flowers || []).filter((f) => f.id !== flowerId);
    const newPoints = user.honeyPoints + honeyEarned;

    await saveUser({
      ...user,
      flowers: newFlowers,
      honeyPoints: newPoints,
      level: computeLevel(newPoints),
      totalHarvested: (user.totalHarvested || 0) + 1,
    });
    return honeyEarned;
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

    const updated: User = {
      ...user,
      bees,
      checks: [check, ...(user.checks || [])],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "check_add",
          message: `${check.issuerName} firmasına ait çek eklendi.`,
          time: Date.now(),
        },
        ...(user.activities || []),
      ].slice(0, 10),
    };
    await saveUser(updated);
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

    await saveUser({
      ...user,
      offerRequests: [req, ...(user.offerRequests || [])],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "offer_start",
          message: "15 dakikalık teklif toplama süreci başlatıldı.",
          time: Date.now(),
        },
        ...(user.activities || []),
      ].slice(0, 10),
    });
  };

  const ensureOfferProgress: UserContextValue["ensureOfferProgress"] = async (checkId) => {
    if (!user) return;

    const reqIdx = (user.offerRequests || []).findIndex((r) => r.checkId === checkId);
    if (reqIdx < 0) return;

    const req = user.offerRequests[reqIdx];
    const check = (user.checks || []).find((c) => c.id === checkId);
    if (!check) return;

    const now = Date.now();
    const elapsed = now - req.startedAt;

    // Pilot hızlandırılmış: teklifler 15s, 45s, 90s
    const targetCount = elapsed >= 90000 ? 3 : elapsed >= 45000 ? 2 : elapsed >= 15000 ? 1 : 0;

    const pulse = computeDailyPulseInternal(user.companyName);
    const newOffers = targetCount > req.offers.length ? computeOffers(check, pulse, req.offers.length) : [];

    let status: OfferRequest["status"] = req.status;
    if (now > req.deadlineAt && req.offers.length < 3) status = "expired";
    if (req.offers.length + newOffers.length >= 3) status = "ready";
    if (status === "expired" && req.offers.length > 0) status = "ready";

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

    const updatedReq: OfferRequest = { ...req, revisionUsed: true, offers: revised, status: "ready" };
    const updatedRequests = [...user.offerRequests];
    updatedRequests[idx] = updatedReq;
    await saveUser({
      ...user,
      bees: updatedBees,
      offerRequests: updatedRequests,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "revision",
          message: "Teklifler için revize talebi iletildi.",
          time: Date.now(),
        },
        ...(user.activities || []),
      ].slice(0, 10),
    });
    return true;
  };

  const pickOffer: UserContextValue["pickOffer"] = async (checkId, offerId) => {
    if (!user) return;
    const req = (user.offerRequests || []).find((r) => r.checkId === checkId);
    if (!req) return;

    const offer = req.offers.find((o) => o.id === offerId);
    if (!offer) return;

    const check = (user.checks || []).find((c) => c.id === checkId);
    if (!check) return;

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

    await saveUser({
      ...user,
      bees: updatedBees,
      checks: updatedChecks,
      offerRequests: updatedRequests,
      completedTransactions: [completed, ...(user.completedTransactions || [])],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "pick_offer",
          message: `${offer.partnerCode} teklifi seçildi, işlem tamamlanıyor.`,
          time: Date.now(),
        },
        ...(user.activities || []),
      ].slice(0, 10),
    });
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
      checkDailySpins,
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
