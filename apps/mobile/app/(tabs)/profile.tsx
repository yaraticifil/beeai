import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "@/components/GlassCard";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const goodnessScore = user?.honeyPoints || 850; 

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.slate, "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 20, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
             <View style={styles.profileImage}>
                <Text style={styles.profileEmoji}>🐝</Text>
             </View>
             <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{user?.companyName || "Kovan Üyesi"}</Text>
          <Text style={styles.userSubtitle}>{user?.phoneNumber || "BeeAI İş Ortağı"}</Text>
        </View>

        <View style={styles.scoreSection}>
          <GlassCard style={styles.scoreCard}>
            <LinearGradient
              colors={["rgba(251,191,36,0.1)", "transparent"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>İyilik Puanı (Goodness Score)</Text>
              <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
            </View>
            <View style={styles.scoreValueRow}>
              <Text style={styles.scoreValue}>{goodnessScore}</Text>
              <View style={styles.scoreTrend}>
                <Ionicons name="caret-up" size={12} color={Colors.primary} />
                <Text style={styles.scoreTrendText}>+12</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, { width: `${(goodnessScore / 1000) * 100}%` }]} />
            </View>
            <Text style={styles.scoreSubtext}>Bir sonraki seviye: <Text style={styles.highlight}>Kraliyet Muhafızı</Text></Text>
          </GlassCard>
        </View>

        <View style={styles.statsRow}>
           <GlassCard style={styles.statCard}>
              <Ionicons name="flash-outline" size={24} color={Colors.gold} />
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Sorgu</Text>
           </GlassCard>
           <GlassCard style={styles.statCard}>
              <Ionicons name="shield-outline" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>%98</Text>
              <Text style={styles.statLabel}>Güvenlik</Text>
           </GlassCard>
        </View>

        <View style={styles.menuSection}>
           <Text style={styles.sectionTitle}>Kovan Ayarları</Text>
           <GlassCard style={styles.menuList}>
              <Pressable style={styles.menuItem}>
                 <View style={[styles.menuIconBox, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                    <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
                 </View>
                 <Text style={styles.menuText}>Bildirimler</Text>
                 <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={styles.menuItem}>
                 <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#10b981" />
                 </View>
                 <Text style={styles.menuText}>Güvenlik ve Gizlilik</Text>
                 <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={styles.menuItem}>
                 <View style={[styles.menuIconBox, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                    <Ionicons name="help-circle-outline" size={20} color="#f59e0b" />
                 </View>
                 <Text style={styles.menuText}>Destek Merkezi</Text>
                 <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </Pressable>
           </GlassCard>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleLogout}
        >
           <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
           <Text style={styles.logoutText}>Kovandan Ayrıl (Güvenli Çıkış)</Text>
        </Pressable>
        <Text style={styles.versionText}>BeeAI Platform v1.0.0-Pilot</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.slate },
  scroll: { paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  profileImageContainer: { position: 'relative', marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  profileEmoji: { fontSize: 50 },
  onlineBadge: { position: 'absolute', bottom: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#10b981', borderWidth: 4, borderColor: '#1e293b' },
  userName: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.white, marginBottom: 4 },
  userSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.5)' },

  scoreSection: { marginBottom: 24 },
  scoreCard: { padding: 24, overflow: 'hidden' },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: 'rgba(255,255,255,0.7)' },
  scoreValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 16 },
  scoreValue: { fontSize: 48, fontFamily: 'Poppins_800ExtraBold', color: Colors.gold },
  scoreTrend: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreTrendText: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginLeft: 2 },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 4 },
  scoreSubtext: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.4)' },
  highlight: { color: Colors.gold, fontFamily: 'Poppins_600SemiBold' },

  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, padding: 20, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.white },
  statLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.5)' },

  menuSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.white, marginBottom: 16, marginLeft: 4 },
  menuList: { padding: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 16 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: 15, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.9)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: 12 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 20, height: 60, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.danger },
  versionText: { textAlign: 'center', marginTop: 24, fontSize: 11, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.2)' },
});
