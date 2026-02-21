import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

// ── Amber accent (Crate Digger theme) applied to selected cell ────────────
// colors.primaryAmber (#c8832a) replaces the bright gold (#FFD700) 

interface CrosswordCellProps {
  letter: string;
  isBlack: boolean;
  isSelected: boolean;
  isInSelectedWord: boolean;
  isRevealed: boolean;
  clueNumber?: number;
  cellSize: number;
  onPress: () => void;
}

export const CrosswordCell: React.FC<CrosswordCellProps> = ({
  letter,
  isBlack,
  isSelected,
  isInSelectedWord,
  isRevealed,
  clueNumber,
  cellSize,
  onPress,
}) => {
  // ── Black (blocked) cell ─────────────────────────────────────────────────
  if (isBlack) {
    return (
      <View
        style={[
          styles.blackCell,
          { width: cellSize, height: cellSize },
        ]}
      />
    );
  }

  // ── Background colour logic ──────────────────────────────────────────────
  const getCellBackground = () => {
    if (isSelected) return colors.primaryAmber;       // warm amber (Crate Digger)
    if (isInSelectedWord) return colors.cellWordHighlight;
    if (isRevealed) return colors.cellRevealed;
    return colors.cellBackground;
  };

  const getLetterColor = () => {
    if (isSelected) return colors.textOnPrimary;
    if (isRevealed) return colors.cellRevealedText;
    return colors.cellBlack;
  };

  const numFontSize = Math.max(6, Math.floor(cellSize * 0.22));
  const letterFontSize = Math.max(10, Math.floor(cellSize * 0.54));

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: getCellBackground(),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {clueNumber !== undefined && !isNaN(clueNumber) && (
        <Text
          style={[
            styles.clueNumber,
            { fontSize: numFontSize, lineHeight: numFontSize + 2 },
            // On selected cell, invert the clue number to stay readable on amber bg
            isSelected && { color: colors.textOnPrimary },
          ]}
        >
          {clueNumber}
        </Text>
      )}
      <Text
        style={[
          styles.letter,
          { fontSize: letterFontSize, color: getLetterColor() },
        ]}
      >
        {letter}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    borderColor: colors.cellBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blackCell: {
    backgroundColor: colors.cellBlack,
    borderWidth: 1,
    borderColor: colors.cellBlackBorder,
  },
  clueNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    color: colors.cellClueNum,
    fontWeight: '700',
  },
  letter: {
    fontWeight: '900',
    textAlign: 'center',
  },
});
