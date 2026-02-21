import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../constants/theme';

// ── Amber accent (Crate Digger theme) applied to selected cell ────────────
// V2-6: Gold LinearGradient replaces flat amber on selected cell
// V2-7: Correct letter flash — scale + amber→green
// V2-8: Wrong letter shake — translateX

interface CrosswordCellProps {
  letter: string;
  isBlack: boolean;
  isSelected: boolean;
  isInSelectedWord: boolean;
  isRevealed: boolean;
  clueNumber?: number;
  cellSize: number;
  onPress: () => void;
  /** Triggers correct-letter flash animation when true */
  isCorrectFlash?: boolean;
  /** Triggers wrong-letter shake animation when true */
  isWrongFlash?: boolean;
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
  isCorrectFlash = false,
  isWrongFlash = false,
}) => {
  // ── V2-8: Shake animation (wrong letter) ─────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── V2-7: Scale + color flash animation (correct letter) ─────────────────
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current; // 0=amber, 1=green

  useEffect(() => {
    if (isWrongFlash) {
      // Reset and run shake
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWrongFlash]);

  useEffect(() => {
    if (isCorrectFlash) {
      // Reset and run scale + color flash
      scaleAnim.setValue(1);
      flashAnim.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 80, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.04, duration: 150, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 270, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 0, duration: 420, useNativeDriver: false }),
        ]),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCorrectFlash]);

  // Interpolate flash color: amber → green → back
  const flashBgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primaryAmber, '#2a5018'],
  });
  // ── Black (blocked) cell — diagonal hatching ──────────────────────────────
  if (isBlack) {
    // Render alternating diagonal strips inside the cell to approximate the
    // CSS repeating-linear-gradient(45deg, ...) pattern from hiphop-crossword.jsx
    const stripeCount = Math.ceil((cellSize * 2) / 8) + 2;
    return (
      <View
        style={[
          styles.blackCell,
          { width: cellSize, height: cellSize, overflow: 'hidden' },
        ]}
      >
        <View
          style={{
            position: 'absolute',
            width: cellSize * 2.5,
            height: cellSize * 2.5,
            top: -cellSize * 0.75,
            left: -cellSize * 0.75,
            transform: [{ rotate: '45deg' }],
            flexDirection: 'row',
          }}
        >
          {Array.from({ length: stripeCount }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 4,
                height: cellSize * 2.5,
                backgroundColor: i % 2 === 0 ? '#0e0b06' : '#181208',
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  // ── Background colour logic ──────────────────────────────────────────────
  const getNonSelectedBackground = () => {
    if (isInSelectedWord) return colors.cellWordHighlight;
    if (isRevealed) return colors.cellRevealed;
    return colors.cellBackground;
  };

  const getLetterColor = () => {
    if (isSelected) return '#1a0e00';              // V2-6: dark on gold gradient
    if (isRevealed) return colors.cellRevealedText;
    return colors.cellBlack;
  };

  const numFontSize = Math.max(6, Math.floor(cellSize * 0.22));
  const letterFontSize = Math.max(10, Math.floor(cellSize * 0.54));

  // ── Cell content (shared between gradient and plain renders) ─────────────
  const cellContent = (
    <>
      {clueNumber !== undefined && !isNaN(clueNumber) && (
        <Text
          style={[
            styles.clueNumber,
            { fontSize: numFontSize, lineHeight: numFontSize + 2 },
            isSelected && { color: 'rgba(20,12,0,0.65)' }, // V2-6: dark on gold
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
    </>
  );

  // ── V2-6: Selected cell — gold LinearGradient ────────────────────────────
  if (isSelected) {
    return (
      <Animated.View
        style={{
          transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
          <LinearGradient
            colors={['#e0a040', '#c8732a']}
            start={{ x: 0.15, y: 0.15 }}
            end={{ x: 0.85, y: 0.85 }}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                // Outer glow for selected cell
                shadowColor: '#c8832a',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 8,
              },
            ]}
          >
            {cellContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── V2-7: Correct flash — animated background color ──────────────────────
  if (isCorrectFlash && letter) {
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
          <Animated.View
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                backgroundColor: flashBgColor,
              },
            ]}
          >
            {cellContent}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Standard cell ────────────────────────────────────────────────────────
  return (
    <Animated.View
      style={{
        transform: [{ translateX: shakeAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: getNonSelectedBackground(),
          },
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {cellContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    borderColor: colors.cellBorder,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Elevation / shadow — cells lift off the grid background
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
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
