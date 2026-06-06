import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Message } from '../types/models';

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
          placeholder="메시지 입력"
          placeholderTextColor="#9c8a90"
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
    minHeight: 210,
    borderTopWidth: 1,
    borderTopColor: '#ead5db',
    backgroundColor: '#fffafb'
  },
  list: {
    maxHeight: 152
  },
  listContent: {
    padding: 12,
    gap: 8
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#51313a'
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f6f6'
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19
  },
  mineText: {
    color: '#ffffff'
  },
  theirsText: {
    color: '#263b3c'
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db',
    color: '#3b2d32'
  },
  send: {
    height: 42,
    minWidth: 62,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2a6b8'
  },
  sendText: {
    color: '#3b2d32',
    fontWeight: '800'
  }
});
