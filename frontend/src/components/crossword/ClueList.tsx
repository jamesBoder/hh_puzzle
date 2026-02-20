import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../constants/theme';
import { Clue } from '../../api/types';

interface ClueListProps {
  cluesAcross: Record<string, Clue>;
  cluesDown: Record<string, Clue>;
  activeClueNumber: string | null;
  activeDirection: 'across' | 'down';
  onCluePress: (clueNum: string, direction: 'across' | 'down') => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  cluesAcross,
  cluesDown,
  activeClueNumber,
  activeDirection,
  onCluePress,
}) => {
  const [tab, setTab] = useState<'across' | 'down'>('across');
  const scrollRef = useRef<ScrollView>(null);

  // Auto-switch tab to match the active direction
  useEffect(() => {
    if (activeDirection) setTab(activeDirection);
  }, [activeDirection]);

  const clues = tab === 'across' ? cluesAcross : cluesDown;

  const sortedEntries = Object.entries(clues).sort(
    ([a], [b]) => parseInt(a, 10) - parseInt(b, 10)
  );

  return (
    <View style={styles.container}>
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'across' && styles.activeTab]}
          onPress={() => setTab('across')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'across' && styles.activeTabText]}>
            ACROSS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'down' && styles.activeTab]}
          onPress={() => setTab('down')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, tab === 'down' && styles.activeTabText]}>
            DOWN
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Clue rows ───────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sortedEntries.map(([num, clue]) => {
          const isActive = num === activeClueNumber && tab === activeDirection;
          return (
            <TouchableOpacity
              key={num}
              style={[styles.clueRow, isActive && styles.activeClueRow]}
              onPress={() => onCluePress(num, tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.clueNum, isActive && styles.activeClueNum]}>
                {num}
              </Text>
              <Text
                style={[styles.clueText, isActive && styles.activeClueText]}
                numberOfLines={2}
              >
                {clue.clue}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: borders.medium,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weights.bold,
  },
  activeTabText: {
    color: colors.primary,
  },
  // ── Clue rows ─────────────────────────────────────────────────────────────
  list: {
    flex: 1,
  },
  clueRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxl,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  activeClueRow: {
    backgroundColor: colors.surfaceAlt,
  },
  clueNum: {
    width: 26,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.black,
    color: colors.primaryMuted,
    marginRight: spacing.md,
    paddingTop: 1,
  },
  activeClueNum: {
    color: colors.primary,
  },
  clueText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  activeClueText: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
});
