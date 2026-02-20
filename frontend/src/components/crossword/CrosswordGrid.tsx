import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { CrosswordCell } from './CrosswordCell';
import { CellData, GridDimensions } from '../../hooks/useGame';

interface CrosswordGridProps {
  cells: Record<string, CellData>;
  dimensions: GridDimensions;
  selectedCell: string | null;
  selectedWordCells: string[];
  onCellPress: (key: string) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 12;

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  cells,
  dimensions,
  selectedCell,
  selectedWordCells,
  onCellPress,
}) => {
  // Compute cell size: fill the screen width, clamped between 24 and 40 px
  const cellSize = useMemo(() => {
    if (dimensions.width === 0) return 32;
    const available = SCREEN_WIDTH - GRID_PADDING * 2;
    const computed = Math.floor(available / dimensions.width);
    return Math.min(Math.max(computed, 24), 40);
  }, [dimensions.width]);

  // Pre-build row arrays so we don't recompute on every render
  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let y = 0; y < dimensions.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < dimensions.width; x++) {
        row.push(`${x},${y}`);
      }
      result.push(row);
    }
    return result;
  }, [dimensions]);

  const gridWidth = cellSize * dimensions.width;
  const gridHeight = cellSize * dimensions.height;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.hScrollContent,
        { minWidth: gridWidth + GRID_PADDING * 2 },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.vScrollContent,
          { minHeight: gridHeight + GRID_PADDING * 2 },
        ]}
      >
        <View style={[styles.grid, { padding: GRID_PADDING }]}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((key) => {
                const cell = cells[key];
                if (!cell) return null;
                return (
                  <CrosswordCell
                    key={key}
                    letter={cell.letter}
                    isBlack={cell.isBlack}
                    isSelected={key === selectedCell}
                    isInSelectedWord={selectedWordCells.includes(key)}
                    isRevealed={cell.isRevealed}
                    clueNumber={cell.clueNumber}
                    cellSize={cellSize}
                    onPress={() => onCellPress(key)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  hScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  vScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  grid: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
