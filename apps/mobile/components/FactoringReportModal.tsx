import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { GlassCard } from './GlassCard';

const { height } = Dimensions.get('window');

interface FactoringReportModalProps {
  visible: boolean;
  onClose: () => void;
  data: {
    checkNo: string;
    issuer: string;
    amount: string;
    date: string;
  };
}

export default function FactoringReportModal({ visible, onClose, data }: FactoringReportModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.content}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Faktoring Ön Değerlendirme Raporu</Text>
              <Text style={styles.subtitle}>Rapor ID: BEV-2026-00318-99</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <GlassCard style={styles.section}>
               <Text style={styles.sectionTitle}>📋 EVRAK KÜNYESİ</Text>
               <View style={styles.grid}>
                  <InfoRow label="Çek Numarası" value={data.checkNo} />
                  <InfoRow label="Keşideci" value={data.issuer} />
                  <InfoRow label="Tutar" value={`₺${data.amount}`} />
                  <InfoRow label="Vade" value={data.date} />
               </View>
            </GlassCard>

            <GlassCard style={styles.section}>
               <Text style={styles.sectionTitle}>🛡️ AI DOĞRULAMA ÇIKTILARI</Text>
               <MetricRow label="Görüntü Tutarlılığı" value="%98" status="success" />
               <MetricRow label="MICR/OCR Eşleşmesi" value="TAM" status="success" />
               <MetricRow label="Islak İmza Analizi" value="ONAY" status="success" />
               <MetricRow label="Tahrifat Taraması" value="TEMİZ" status="success" />
            </GlassCard>

            <GlassCard style={[styles.section, { borderColor: 'rgba(16,185,129,0.3)' }]}>
               <Text style={[styles.sectionTitle, { color: Colors.riskLow }]}>⚖️ SEKTÖREL GÖRÜŞ (ADVISORY)</Text>
               <Text style={styles.advisoryText}>
                 Evrak üzerinde herhangi bir dijital veya fiziksel manipülasyon izine rastlanmamıştır. 
                 Keşideci geçmiş ödeme performansı (Hive-Pulse) "Normal" seviyededir.
               </Text>
               <View style={styles.tagContainer}>
                  <View style={styles.tag}><Text style={styles.tagText}>TEMLİK UYGUNDUR</Text></View>
                  <View style={styles.tag}><Text style={styles.tagText}>HIZLI LİSTE</Text></View>
               </View>
            </GlassCard>

            <View style={styles.footerInfo}>
               <Text style={styles.footerLabel}>Valör Beklentisi: <Text style={styles.footerValue}>T+0 (Anında)</Text></Text>
               <Text style={styles.footerLabel}>Risk Marjı Tavsiyesi: <Text style={styles.footerValue}>%2.40 - %2.75</Text></Text>
            </View>
            
            <Pressable style={styles.downloadBtn}>
               <Ionicons name="download-outline" size={20} color={Colors.slate} />
               <Text style={styles.downloadText}>PDF Raporu İndir</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MetricRow({ label, value, status }: { label: string, value: string, status: 'success' | 'warning' | 'danger' }) {
  const color = status === 'success' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={[styles.metricBadge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  content: { height: height * 0.85, backgroundColor: '#0f172a', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.white },
  subtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  
  scroll: { paddingBottom: 40 },
  section: { padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: Colors.gold, marginBottom: 16 },
  
  grid: { gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.4)' },
  infoValue: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.white },
  
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.8)' },
  metricBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  metricValue: { fontSize: 12, fontFamily: 'Poppins_700Bold' },

  advisoryText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.6)', lineHeight: 20 },
  tagContainer: { flexDirection: 'row', gap: 8, marginTop: 16 },
  tag: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  tagText: { fontSize: 10, fontFamily: 'Poppins_800ExtraBold', color: '#10b981' },

  footerInfo: { marginTop: 8, marginBottom: 24, gap: 4 },
  footerLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.4)' },
  footerValue: { color: Colors.white, fontFamily: 'Poppins_600SemiBold' },

  downloadBtn: { height: 56, backgroundColor: Colors.gold, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 },
  downloadText: { fontSize: 15, fontFamily: 'Poppins_800ExtraBold', color: Colors.slate },
});
