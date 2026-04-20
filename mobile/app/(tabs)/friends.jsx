import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { useState } from 'react';
import { C, shadow, avatarColor } from '../../constants/theme';

/* Seed contacts grouped by squad */
const SQUADS = [
  {
    squad: 'נגד הוט',
    members: [
      { id: 1, name: 'דנה ז.', lastSeen: 'לפני 5 דקות', online: true },
      { id: 2, name: 'שי ר.',  lastSeen: 'לפני שעה',    online: false },
    ],
  },
  {
    squad: 'נגד רכבת ישראל',
    members: [
      { id: 3, name: 'אמיר ל.', lastSeen: 'כעת',       online: true },
      { id: 4, name: 'נעמה ט.', lastSeen: 'לפני יום',  online: false },
      { id: 5, name: 'יוסי ב.', lastSeen: 'לפני 3 שעות', online: false },
    ],
  },
];

function ChatWindow({ contact, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, mine: false, text: 'אחלה שפגשתי מישהו שגם נפגע!', time: '22:10' },
    { id: 2, mine: true,  text: 'גם אני! יש לך תיעוד?',         time: '22:11' },
  ]);
  const [input, setInput] = useState('');
  const color = avatarColor(contact.name);

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), mine: true, text: input.trim(), time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.white }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={{ fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <View style={[styles.chatAvatar, { backgroundColor: color }]}>
            <Text style={styles.chatAvatarText}>{contact.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{contact.name}</Text>
            <Text style={styles.chatOnline}>{contact.online ? '🟢 מחובר' : contact.lastSeen}</Text>
          </View>
          <TouchableOpacity style={styles.chatMenuBtn}>
            <Text style={{ fontSize: 20, color: C.gray500 }}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(m) => String(m.id)}
          style={{ flex: 1, backgroundColor: C.gray100 }}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, item.mine && { color: C.black }]}>{item.text}</Text>
              <Text style={styles.bubbleTime}>{item.time}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="כתוב הודעה..."
            placeholderTextColor={C.gray400}
            textAlign="right"
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={{ fontSize: 20 }}>✈️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function FriendsScreen() {
  const [search, setSearch] = useState('');
  const [chat, setChat] = useState(null);

  const filtered = SQUADS.map((s) => ({
    ...s,
    members: s.members.filter((m) => !search || m.name.includes(search)),
  })).filter((s) => s.members.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.gray100 }}>
      {chat && <ChatWindow contact={chat} onClose={() => setChat(null)} />}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="חפש לפי כינוי..."
          placeholderTextColor={C.gray400}
          textAlign="right"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.squad}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: squad }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ המאבק {squad.squad}</Text>
            {squad.members.map((m) => {
              const color = avatarColor(m.name);
              return (
                <TouchableOpacity key={m.id} style={styles.contactRow} onPress={() => setChat(m)} activeOpacity={0.85}>
                  <View style={{ position: 'relative' }}>
                    <View style={[styles.contactAvatar, { backgroundColor: color }]}>
                      <Text style={styles.contactAvatarText}>{m.name.charAt(0)}</Text>
                    </View>
                    {m.online && <View style={styles.onlineDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{m.name}</Text>
                    <Text style={styles.contactSeen}>{m.online ? 'מחובר עכשיו' : m.lastSeen}</Text>
                  </View>
                  <Text style={{ fontSize: 18, color: C.gray300 }}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 44 }}>👥</Text>
            <Text style={styles.emptyTitle}>אין חברים למאבק עדיין</Text>
            <Text style={styles.emptySub}>הצטרף לקבוצת לחץ כדי להתחבר עם אחרים</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, margin: 12, borderRadius: 12,
    padding: 12, borderWidth: 1.5, borderColor: C.gray200,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.dark },

  section: { marginBottom: 4 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: C.gray500,
    textAlign: 'right', paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.gray100,
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.gray100,
  },
  contactAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  contactAvatarText: { fontSize: 18, fontWeight: '700', color: C.white },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.green, borderWidth: 2, borderColor: C.white,
  },
  contactName: { fontSize: 15, fontWeight: '700', color: C.dark, textAlign: 'right' },
  contactSeen: { fontSize: 12, color: C.gray500, textAlign: 'right', marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 14 },
  emptySub: { fontSize: 13, color: C.gray500, marginTop: 6, textAlign: 'center', paddingHorizontal: 30 },

  /* Chat */
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.white, paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.gray200,
  },
  backBtn: { padding: 4 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chatAvatarText: { fontSize: 16, fontWeight: '700', color: C.white },
  chatName: { fontSize: 15, fontWeight: '700', color: C.dark, textAlign: 'right' },
  chatOnline: { fontSize: 11, color: C.gray500, textAlign: 'right' },
  chatMenuBtn: { padding: 4 },

  bubble: { maxWidth: '80%', borderRadius: 16, padding: 10, paddingHorizontal: 14, gap: 3 },
  bubbleMine: { backgroundColor: C.yellow, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: C.white, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.gray200 },
  bubbleText: { fontSize: 14, color: C.dark, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: C.gray400, textAlign: 'right' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1, borderTopColor: C.gray200,
  },
  chatInput: {
    flex: 1, backgroundColor: C.gray100, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: C.dark,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.yellow, justifyContent: 'center', alignItems: 'center',
  },
});
