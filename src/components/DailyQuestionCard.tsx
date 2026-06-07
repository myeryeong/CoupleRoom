import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DailyAnswer, DailyQuestion } from '../types/models';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

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
            placeholderTextColor={colors.textSub}
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
    borderRadius: 18,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft
  },
  label: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '900'
  },
  question: {
    marginTop: 5,
    color: colors.textMain,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22
  },
  row: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    color: colors.textMain
  },
  save: {
    minWidth: 56,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  saveText: {
    color: colors.textMain,
    fontWeight: '900'
  },
  answer: {
    marginTop: spacing.sm,
    color: colors.accentBrown,
    lineHeight: 20
  },
  muted: {
    marginTop: spacing.sm,
    color: colors.textSub,
    fontSize: 12
  }
});
