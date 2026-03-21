import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Pressable, Animated as RNAnimated, Platform, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import Colors from '@/constants/colors';
import { GlassCard } from './GlassCard';

const { width, height } = Dimensions.get('window');

const ANALYSIS_STEPS = [
  "MICR Hattı Ayrıştırılıyor...",
  "Banka Logosu ve Filigran Testi...",
  "Keşideci Güven Puanı (Hive Score) Sorgulanıyor...",
  "Tutar (Sayı vs Yazı) Font Analizi...",
  "Islak İmza Baskı Derinliği Ölçümü...",
  "Kağıt Dokusu ve Işık Kırılma Anomalileri...",
  "Çek Seri No Ardaşıklık Doğrulaması...",
  "KVKK Uyumlu Karaliste Kontrolü...",
  "Dijital Tahrifat ve Montaj Tespiti...",
  "Final Teknik Risk Skoru Hesaplanıyor..."
];

const FOCUS_REGIONS = [
  { top: '80%', left: '10%', width: '80%', height: '15%' }, // MICR
  { top: '5%', left: '5%', width: '20%', height: '15%' },  // Logo
  { top: '15%', left: '40%', width: '50%', height: '10%' }, // Issuer
  { top: '30%', left: '70%', width: '25%', height: '10%' }, // Amount
  { top: '50%', left: '60%', width: '35%', height: '30%' }, // Signature
  { top: '0%', left: '0%', width: '100%', height: '100%' }, // Texture (Full)
  { top: '5%', left: '75%', width: '20%', height: '10%' },  // Serial
  { top: '40%', left: '10%', width: '40%', height: '10%' }, // Blacklist
  { top: '0%', left: '0%', width: '100%', height: '100%' }, // Tamper (Full)
  { top: '0%', left: '0%', width: '0%', height: '0%' },     // Calculation
];

const mockStats = [85, 92, 78, 88, 95]; // Authenticity, Issuer, Tamper, Visual, Consistency

export default function VerificationSimulator({ onComplete, onShowReport }: { onComplete: () => void, onShowReport: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    if (currentStep < ANALYSIS_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
      // Animate risk score
      let start = 0;
      const end = 12; // 12% Risk
      const duration = 1000;
      const stepTime = Math.abs(Math.floor(duration / end));
      const timer = setInterval(() => {
        start += 1;
        setRiskScore(start);
        if (start === end) clearInterval(timer);
      }, stepTime);
    }
  }, [currentStep]);

  const radarPoints = useMemo(() => {
    const center = 80;
    const radius = 60;
    const angleStep = (Math.PI * 2) / 5;
    return mockStats.map((stat, i) => {
      const r = (stat / 100) * radius;
      const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
      const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>BEEAI VERIFY ENGINE</Text>
          <Text style={styles.title}>
            {isFinished ? "Analiz Tamamlandı" : "Akıllı Arılar Analiz Ediyor..."}
          </Text>
        </View>

        <View style={styles.checkPreviewContainer}>
          <Image 
            source={require('@/assets/images/sample-check.png')} 
            style={styles.checkImage} 
            resizeMode="cover" 
          />
          {!isFinished && FOCUS_REGIONS && FOCUS_REGIONS[currentStep] && (
            <Animated.View 
              entering={FadeIn}
              style={[
                styles.focusOverlay, 
                { 
                  top: FOCUS_REGIONS[currentStep]?.top, 
                  left: FOCUS_REGIONS[currentStep]?.left,
                  width: FOCUS_REGIONS[currentStep]?.width,
                  height: FOCUS_REGIONS[currentStep]?.height,
                } as any
              ]} 
            />
          )}
          <View style={styles.scanline} />
        </View>

        {!isFinished ? (
          <View style={styles.stepsContainer}>
            {ANALYSIS_STEPS.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={[
                  styles.stepDot, 
                  index < currentStep && { backgroundColor: Colors.primary },
                  index === currentStep && { backgroundColor: Colors.gold }
                ]}>
                  {index < currentStep && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                </View>
                <Text style={[
                  styles.stepText,
                  index === currentStep && { color: Colors.gold, fontFamily: 'Poppins_700Bold' },
                  index > currentStep && { opacity: 0.3 }
                ]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInDown} style={styles.resultContainer}>
            <View style={styles.scoreRow}>
               <View style={styles.scoreCircle}>
                 <Text style={styles.scorePercentage}>%{riskScore}</Text>
                 <Text style={styles.scoreLabel}>TEKNİK RİSK</Text>
               </View>
               
               <View style={styles.radarContainer}>
                <Svg height="160" width="160" viewBox="0 0 160 160">
                  {/* Radar Background */}
                  {[0.2, 0.4, 0.6, 0.8, 1].map((m) => (
                    <Polygon
                      key={m}
                      points={mockStats.map((_, i) => {
                        const r = 60 * m;
                        const x = 80 + r * Math.cos(i * (Math.PI * 2 / 5) - Math.PI / 2);
                        const y = 80 + r * Math.sin(i * (Math.PI * 2 / 5) - Math.PI / 2);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Axis lines */}
                  {mockStats.map((_, i) => {
                    const x = 80 + 60 * Math.cos(i * (Math.PI * 2 / 5) - Math.PI / 2);
                    const y = 80 + 60 * Math.sin(i * (Math.PI * 2 / 5) - Math.PI / 2);
                    return <Line key={i} x1="80" y1="80" x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
                  })}
                  {/* The Data Polygon */}
                  <Polygon
                    points={radarPoints}
                    fill="rgba(34,197,94,0.3)"
                    stroke={Colors.primary}
                    strokeWidth="2"
                  />
                </Svg>
               </View>
            </View>

            <GlassCard style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons name="shield-checkmark" size={24} color={Colors.riskLow} />
                <View>
                  <Text style={styles.summaryTitle}>Ön Doğrulama Başarılı</Text>
                  <Text style={styles.summaryDesc}>Çek teknik kriterlere göre "Düşük Riskli" olarak sınıflandırılmıştır.</Text>
                </View>
              </View>
            </GlassCard>

            <View style={styles.actionRow}>
               <Pressable style={styles.reportBtn} onPress={onShowReport}>
                 <Text style={styles.reportBtnText}>Faktoring Raporunu İncele</Text>
                 <Ionicons name="document-text-outline" size={20} color={Colors.white} />
               </Pressable>
               <Pressable style={styles.closeBtn} onPress={onComplete}>
                 <Text style={styles.closeBtnText}>Kapat</Text>
               </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 24, 
    paddingTop: 60, 
    alignItems: 'center',
    width: Platform.OS === 'web' ? Math.min(width, 500) : width,
    alignSelf: 'center',
  },
  header: { alignItems: 'center', marginBottom: 30 },
  brand: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: Colors.gold, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 20, fontFamily: 'Poppins_800ExtraBold', color: Colors.white, textAlign: 'center' },
  
  checkPreviewContainer: { width: width - 48, height: (width - 48) * 0.45, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  checkImage: { width: '100%', height: '100%', opacity: 0.6 },
  focusOverlay: { position: 'absolute', borderWidth: 2, borderColor: Colors.gold, backgroundColor: 'rgba(251,191,36,0.1)' },
  scanline: { position: 'absolute', width: '100%', height: 2, backgroundColor: Colors.gold, top: '50%', opacity: 0.5 },

  stepsContainer: { width: '100%', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)' },

  resultContainer: { width: '100%' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  scorePercentage: { fontSize: 32, fontFamily: 'Poppins_800ExtraBold', color: Colors.white },
  scoreLabel: { fontSize: 10, fontFamily: 'Poppins_700Bold', color: 'rgba(255,255,255,0.4)' },
  radarContainer: { width: 160, height: 160 },

  summaryCard: { marginBottom: 24, padding: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.white },
  summaryDesc: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  actionRow: { gap: 12 },
  reportBtn: { height: 56, backgroundColor: Colors.verifyIndigo, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  reportBtnText: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.white },
  closeBtn: { height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: 'rgba(255,255,255,0.5)' },
});
