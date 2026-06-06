import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DailyAnswer, DailyQuestion } from '../types/models';

type Props = {
  question: DailyQuestion | null;
  answers: DailyAnswer[];
  myUserId: string;
  onSubmit: (answer: string) => void;
};

export default function DailyQuestionCard({ question, answers, myUserId, onSubmit }: Props) {
  const [answer, setAnswer] = useState('');
  const myAnswer = useMemo(() => answers.find((item) => item.user_id === myUserId), [answers, myUserId]);
  const partnerAnswer = useMemo(() => answers.find((item) => item.user_id !== myUserId), [answers, myUserId]);

  if (!question) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>오늘의 질문</Text>
      <Text style={styles.question}>{question.question}</Text>
      {myAnswer ? (
        <Text style={styles.answer}>내 답변: {myAnswer.answer}</Text>
      ) : (
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder="짧게 답해보기"
            placeholderTextColor="#9c8a90"
          />
          <Pressable
            style={styles.save}
            onPress={() => {
              onSubmit(answer);
              setAnswer('');
            }}
          >
            <Text style={styles.saveText}>저장</Text>
          </Pressable>
        </View>
      )}
      {myAnswer && partnerAnswer ? <Text style={styles.answer}>상대 답변: {partnerAnswer.answer}</Text> : null}
      {myAnswer && !partnerAnswer ? <Text style={styles.muted}>서로 답하면 상대 답변이 보여요.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db'
  },
  label: {
    fontSize: 12,
    color: '#8d6270',
    fontWeight: '800'
  },
  question: {
    marginTop: 4,
    color: '#3b2d32',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ead5db',
    paddingHorizontal: 12,
    color: '#3b2d32'
  },
  save: {
    minWidth: 56,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8fcfd0'
  },
  saveText: {
    color: '#263b3c',
    fontWeight: '800'
  },
  answer: {
    marginTop: 8,
    color: '#51313a',
    lineHeight: 19
  },
  muted: {
    marginTop: 8,
    color: '#9c8a90',
    fontSize: 12
  }
});
