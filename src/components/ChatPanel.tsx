import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Message } from '../types/models';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type Props = {
  messages: Message[];
  myUserId: string;
  onSend: (content: string) => void;
};

export default function ChatPanel({ messages, myUserId, onSend }: Props) {
  const [content, setContent] = useState('');

  const submit = () => {
    if (!content.trim()) {
      return;
    }
    onSend(content);
    setContent('');
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>우리 대화</Text>
        <Text style={styles.count}>{messages.length}/50</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const mine = item.sender_id === myUserId;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.messageText, mine ? styles.mineText : styles.theirsText]}>{item.content}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="따뜻한 말을 남겨요"
          placeholderTextColor={colors.textSub}
          returnKeyType="send"
          onSubmitEditing={submit}
        />
        <Pressable style={styles.send} onPress={submit}>
          <Text style={styles.sendText}>전송</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    minHeight: 214,
    borderRadius: 18,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft
  },
  header: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: colors.textMain,
    fontWeight: '900'
  },
  count: {
    color: colors.textSub,
    fontSize: 12,
    fontWeight: '700'
  },
  list: {
    maxHeight: 142
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryDark
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.roomWall,
    borderWidth: 1,
    borderColor: colors.border
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  mineText: {
    color: colors.white
  },
  theirsText: {
    color: colors.textMain
  },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textMain
  },
  send: {
    height: 42,
    minWidth: 62,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  sendText: {
    color: colors.textMain,
    fontWeight: '900'
  }
});
