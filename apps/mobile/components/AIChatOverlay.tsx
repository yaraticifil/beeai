import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/colors';

export default function AIChatOverlay({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Merhaba! Ben BeeAI Kovan Asistanı. Size nasıl yardımcı olabilirim?', isUser: false },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulated AI Response
    setTimeout(() => {
      const botMsg = { 
        id: (Date.now() + 1).toString(), 
        text: 'Bu konuda Kraliçe Arı analizi tamamlanıyor. Size factoring süreçleri veya teknik doğrulama hakkında bilgi verebilirim.', 
        isUser: false 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.centered}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.beeIcon}>
                  <Ionicons name="nutrition" size={20} color={Colors.white} />
                </View>
                <View>
                  <Text style={styles.title}>Kovan Asistanı</Text>
                  <Text style={styles.status}>Çevrimiçi (AI)</Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.chatArea}>
              {messages.map(m => (
                <View key={m.id} style={[styles.msgWrapper, m.isUser ? styles.userWrapper : styles.botWrapper]}>
                  <View style={[styles.msgBubble, m.isUser ? styles.userBubble : styles.botBubble]}>
                    <Text style={[styles.msgText, m.isUser ? styles.userText : styles.botText]}>{m.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                value={input} 
                onChangeText={setInput}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <Pressable style={styles.sendBtn} onPress={sendMessage}>
                <Ionicons name="send" size={20} color={Colors.slate} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'flex-end' },
  modal: { 
    height: '80%', 
    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)' 
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  beeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.white },
  status: { fontSize: 10, color: Colors.primary, fontFamily: 'Poppins_400Regular' },
  closeBtn: { padding: 4 },
  chatArea: { padding: 20, gap: 16 },
  msgWrapper: { width: '100%', flexDirection: 'row' },
  userWrapper: { justifyContent: 'flex-end' },
  botWrapper: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: Colors.gold, borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: 'rgba(255,255,255,0.05)', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, fontFamily: 'Poppins_400Regular' },
  userText: { color: Colors.slate },
  botText: { color: Colors.white },
  inputRow: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, paddingHorizontal: 20, color: Colors.white, fontFamily: 'Poppins_400Regular' },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' }
});
