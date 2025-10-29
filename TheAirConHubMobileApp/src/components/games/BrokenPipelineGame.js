import React, { useState, useEffect, useMemo, useCallback } from 'react';
// This is the correct import for your Expo project
import { StyleSheet, View, TouchableOpacity, Dimensions, Text, Alert, ScrollView } from 'react-native';

// This is the correct import for your Expo project
import * as Haptics from 'expo-haptics';

// PREVIEW FIX: Mock Haptics object removed.





// --- Config ---

// NEW: Stage configuration
const STAGE_CONFIG = {
  1: { rows: 4, cols: 4, start: { r: 0, c: 0 }, end: { r: 3, c: 3 } },
  2: { rows: 5, cols: 5, start: { r: 0, c: 0 }, end: { r: 4, c: 4 } },
  3: { rows: 6, cols: 6, start: { r: 0, c: 0 }, end: { r: 5, c: 5 } },
};

// Get screen dimensions
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
// Calculate a constant game area size
const gameAreaSize = Math.min(windowWidth * 0.9, windowHeight * 0.7);

// --- Game Logic ---

// --- NEW LEVEL GENERATOR ---

/**
 * Helper to get the direction from one cell to an adjacent one.
 * e.g., from {r:0,c:0} to {r:0,c:1} is 'RIGHT'
 */
const getDir = (from, to) => {
  if (to.r < from.r) return 'TOP';
  if (to.r > from.r) return 'BOTTOM';
  if (to.c < from.c) return 'LEFT';
  if (to.c > from.c) return 'RIGHT';
  return null;
};

/**
 * Helper to get the pipe type and rotation from its required openings.
 * e.g., ['TOP', 'BOTTOM'] => { type: 'STRAIGHT', rotation: 0 }
 */
const getPipeFromOpenings = (openings) => {
  const [o1, o2] = openings.sort(); // Sort to simplify checks

  if (o1 === 'BOTTOM' && o2 === 'TOP') return { type: 'STRAIGHT', rotation: 0 };
  if (o1 === 'LEFT' && o2 === 'RIGHT') return { type: 'STRAIGHT', rotation: 1 };

  if (o1 === 'RIGHT' && o2 === 'TOP') return { type: 'L_BEND', rotation: 0 };
  if (o1 === 'BOTTOM' && o2 === 'RIGHT') return { type: 'L_BEND', rotation: 1 };
  if (o1 === 'BOTTOM' && o2 === 'LEFT') return { type: 'L_BEND', rotation: 2 };
  if (o1 === 'LEFT' && o2 === 'TOP') return { type: 'L_BEND', rotation: 3 };

  // Should not happen in a valid path
  return { type: 'STRAIGHT', rotation: 0 };
};

/**
 * Gets the rotation for a START or END piece.
 * 0:T, 1:R, 2:B, 3:L
 */
const getTerminalRotation = (dir) => {
  if (dir === 'TOP') return 0;
  if (dir === 'RIGHT') return 1;
  if (dir === 'BOTTOM') return 2;
  if (dir === 'LEFT') return 3;
  return 0;
};

/**
 * Shuffles an array in place.
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

/**
 * Creates a new randomized, solvable level FOR A GIVEN STAGE.
 */
const createInitialLevel = (stage) => {
  const { rows, cols, start, end } = STAGE_CONFIG[stage];

  // 1. Fill grid with random junk pipes first
  const grid = Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({
      type: Math.random() > 0.5 ? 'STRAIGHT' : 'L_BEND',
      rotation: Math.floor(Math.random() * 4),
      isConnected: false,
      isFixed: false,
    }))
  );

  // 2. Find a solvable path using Randomized DFS
  const path = [];
  const visited = new Set();
  
  const dfs = (r, c) => {
    const posKey = `${r},${c}`;
    if (r < 0 || r >= rows || c < 0 || c >= cols || visited.has(posKey)) {
      return false;
    }

    path.push({ r, c });
    visited.add(posKey);

    if (r === end.r && c === end.c) {
      return true; // Reached the end
    }

    const neighbors = [
      { r: r - 1, c: c },
      { r: r + 1, c: c },
      { r: r, c: c - 1 },
      { r: r, c: c + 1 }
    ];
    shuffleArray(neighbors); // Randomize direction

    for (const n of neighbors) {
      if (dfs(n.r, n.c)) {
        return true; // Path found
      }
    }

    path.pop(); // Backtrack
    return false;
  };

  dfs(start.r, start.c); // Find the path

  // 3. Place the solution pipes along the path
  const solutionRotations = {};
  for (let i = 0; i < path.length; i++) {
    const pos = path[i];
    const posKey = `${pos.r},${pos.c}`;

    if (i === 0) {
      // START Pipe
      const dir = getDir(pos, path[i + 1]);
      const rotation = getTerminalRotation(dir);
      grid[pos.r][pos.c] = { type: 'START', rotation, isFixed: true, isConnected: true };
    } else if (i === path.length - 1) {
      // END Pipe
      const dir = getDir(pos, path[i - 1]);
      const rotation = getTerminalRotation(dir);
      grid[pos.r][pos.c] = { type: 'END', rotation, isFixed: true, isConnected: false };
    } else {
      // MIDDLE Pipe
      const dir1 = getDir(pos, path[i - 1]);
      const dir2 = getDir(pos, path[i + 1]);
      const { type, rotation } = getPipeFromOpenings([dir1, dir2]);
      grid[pos.r][pos.c] = { type, rotation, isFixed: false, isConnected: false };
      solutionRotations[posKey] = rotation;
    }
  }

  // 4. Randomize rotations of non-fixed pipes, ensuring it's not the solution
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isFixed) continue;

      const posKey = `${r},${c}`;
      const solutionRotation = solutionRotations[posKey]; // This pipe might be junk or on the path

      if (solutionRotation !== undefined) {
        // This is a path piece, scramble it
        let newRotation = Math.floor(Math.random() * 4);
        while (newRotation === solutionRotation) {
          newRotation = Math.floor(Math.random() * 4);
        }
        grid[r][c].rotation = newRotation;
      } else {
        // This is a junk piece, just set a random rotation
        grid[r][c].rotation = Math.floor(Math.random() * 4);
      }
    }
  }
  
  return grid;
};

/**
 * Returns an array of open directions for a given pipe piece.
 * e.g., ['TOP', 'BOTTOM']
 */
const getOpenings = (piece) => {
  if (!piece) return [];
  
  const { type, rotation } = piece;

  switch (type) {
    case 'START':
      // 0:T, 1:R, 2:B, 3:L
      if (rotation === 0) return ['TOP'];
      if (rotation === 1) return ['RIGHT'];
      if (rotation === 2) return ['BOTTOM'];
      if (rotation === 3) return ['LEFT'];
      return [];
      
    case 'END':
      // 0:T, 1:R, 2:B, 3:L
      if (rotation === 0) return ['TOP'];
      if (rotation === 1) return ['RIGHT'];
      if (rotation === 2) return ['BOTTOM'];
      if (rotation === 3) return ['LEFT'];
      return [];

    case 'STRAIGHT':
      return rotation % 2 === 0 ? ['TOP', 'BOTTOM'] : ['LEFT', 'RIGHT'];

    case 'L_BEND':
      if (rotation === 0) return ['TOP', 'RIGHT'];
      if (rotation === 1) return ['RIGHT', 'BOTTOM'];
      if (rotation === 2) return ['BOTTOM', 'LEFT'];
      if (rotation === 3) return ['LEFT', 'TOP'];
      return [];

    default:
      return [];
  }
};

const getOppositeDir = (dir) => {
  if (dir === 'TOP') return 'BOTTOM';
  if (dir === 'BOTTOM') return 'TOP';
  if (dir === 'LEFT') return 'RIGHT';
  if (dir === 'RIGHT') return 'LEFT';
};

// --- Component ---

export default function BrokenPipelineGame() {
  const [currentStage, setCurrentStage] = useState(1);
  const [grid, setGrid] = useState(() => createInitialLevel(currentStage));
  const [stageWon, setStageWon] = useState(false); // Flag for when *current* stage is won
  const [gameFinished, setGameFinished] = useState(false); // Flag for winning stage 3

  // --- DYNAMIC CONFIG ---
  // Recalculate config and sizes based on the current stage
  const { rows, cols, start, end } = STAGE_CONFIG[currentStage];

  const dynamicSize = useMemo(() => {
    const cellSize = Math.floor(gameAreaSize / cols);
    const pipeWidth = Math.floor(cellSize * 0.2);
    const pipeCenterSize = pipeWidth;
    const pipeStubLength = Math.floor((cellSize - pipeWidth) / 2);

    return {
      cell: { width: cellSize, height: cellSize },
      pipeCenter: { width: pipeCenterSize, height: pipeCenterSize },
      pipeStubTop: { width: pipeWidth, height: pipeStubLength, top: 0 },
      pipeStubBottom: { width: pipeWidth, height: pipeStubLength, bottom: 0 },
      pipeStubLeft: { width: pipeStubLength, height: pipeWidth, left: 0 },
      pipeStubRight: { width: pipeStubLength, height: pipeWidth, right: 0 },
      startNode: { width: cellSize * 0.5, height: cellSize * 0.5, borderRadius: cellSize * 0.25 },
      endNode: { width: cellSize * 0.5, height: cellSize * 0.5, borderRadius: cellSize * 0.25 },
    };
  }, [cols, gameAreaSize]);
  // --- END DYNAMIC CONFIG ---

  /**
   * Advance to the next stage.
   */
  const advanceToNextStage = useCallback(() => {
    const nextStage = currentStage + 1;
    if (nextStage > 3) {
      setGameFinished(true); // Won the final stage
      return;
    }
    setCurrentStage(nextStage);
    setGrid(createInitialLevel(nextStage));
    setStageWon(false);
  }, [currentStage]);

  /**
   * Reset the game back to Stage 1.
   */
  const resetGame = useCallback(() => {
    setCurrentStage(1);
    setGrid(createInitialLevel(1));
    setStageWon(false);
    setGameFinished(false);
  }, []);

  /**
   * Handle user tap on a pipe.
   */
  const handlePress = (r, c) => {
    if (stageWon || gameFinished || grid[r][c].isFixed) {
      return; // Don't rotate fixed pieces or if game is won
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Create a new grid state
    const newGrid = grid.map((row, rowIndex) => 
      row.map((cell, colIndex) => {
        if (r === rowIndex && c === colIndex) {
          return {
            ...cell,
            rotation: (cell.rotation + 1) % 4,
          };
        }
        return cell;
      })
    );
    setGrid(newGrid);
  };

  // This useEffect triggers the connection check *after* the state has updated
  useEffect(() => {
    if (stageWon || gameFinished) return; // Don't check if stage is already won

    const checkConnections = (currentGrid) => {
      // 1. Create a new grid and reset all 'isConnected'
      const newGrid = currentGrid.map(row => 
        row.map(cell => ({ ...cell, isConnected: false }))
      );

      let win = false;
      const q = [start]; // Use dynamic start
      const visited = new Set([`${start.r},${start.c}`]);
      newGrid[start.r][start.c].isConnected = true;

      while (q.length > 0) {
        const pos = q.shift();
        const piece = newGrid[pos.r][pos.c];
        const openings = getOpenings(piece);

        for (const dir of openings) {
          let nr = pos.r;
          let nc = pos.c;

          if (dir === 'TOP') nr--;
          if (dir === 'BOTTOM') nr++;
          if (dir === 'LEFT') nc--;
          if (dir === 'RIGHT') nc++;

          const neighborPosKey = `${nr},${nc}`;

          // 1. Check bounds
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) { // Use dynamic rows/cols
            continue;
          }
          // 2. Check visited
          if (visited.has(neighborPosKey)) {
            continue;
          }

          // 3. Check if neighbor connects back
          const neighborPiece = newGrid[nr][nc];
          const neighborOpenings = getOpenings(neighborPiece);
          const oppositeDir = getOppositeDir(dir);

          if (neighborOpenings.includes(oppositeDir)) {
            // Connection successful!
            newGrid[nr][nc].isConnected = true;
            visited.add(neighborPosKey);
            q.push({ r: nr, c: nc });

            // 4. Check for Win
            if (neighborPiece.type === 'END') {
              win = true;
            }
          }
        }
      }

      // --- FIX to prevent infinite loop ---
      let connectionsChanged = false;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (newGrid[r][c].isConnected !== currentGrid[r][c].isConnected) {
            connectionsChanged = true;
            break;
          }
        }
        if (connectionsChanged) break;
      }

      if (connectionsChanged) {
        setGrid(newGrid);
      }
      // --- End Fix ---

      // --- NEW STAGE LOGIC ---
      if (win && !stageWon) {
        setStageWon(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (currentStage < 3) {
          // Advance to next stage
          Alert.alert(`Stage ${currentStage} Complete!`, "Get ready for the next level!", [
            { text: "Let's Go!", onPress: () => advanceToNextStage() }
          ]);
        } else {
          // Final win
          setGameFinished(true);
          Alert.alert("All Stages Complete!", "You're a master plumber!", [
            { text: "Play Again", onPress: () => resetGame() }
          ]);
        }
      }
    };
    
    checkConnections(grid);

  }, [grid, currentStage, stageWon, gameFinished, rows, cols, start, advanceToNextStage, resetGame]); // Re-run whenever the grid or stage changes

  // --- Render ---

  /**
   * Renders a single pipe cell.
   */
  const renderCell = (piece, r, c) => {
    if (!piece) return <View style={[styles.cell, dynamicSize.cell]} />;

    const openings = getOpenings(piece);
    const has = (dir) => openings.includes(dir);
    const connectedStyle = piece.isConnected ? styles.pipeConnected : null;

    return (
      <TouchableOpacity
        key={`${r}-${c}`}
        style={[styles.cell, dynamicSize.cell]}
        onPress={() => handlePress(r, c)}
        activeOpacity={0.7}
      >
        {/* Center */}
        {piece.type !== 'START' && piece.type !== 'END' && (
          <View style={[styles.pipeCenter, dynamicSize.pipeCenter, connectedStyle]} />
        )}

        {/* Stubs */}
        {has('TOP') && <View style={[styles.pipeStub, dynamicSize.pipeStubTop, connectedStyle]} />}
        {has('BOTTOM') && <View style={[styles.pipeStub, dynamicSize.pipeStubBottom, connectedStyle]} />}
        {has('LEFT') && <View style={[styles.pipeStub, dynamicSize.pipeStubLeft, connectedStyle]} />}
        {has('RIGHT') && <View style={[styles.pipeStub, dynamicSize.pipeStubRight, connectedStyle]} />}

        {/* Start/End Nodes */}
        {piece.type === 'START' && <View style={[styles.startNode, dynamicSize.startNode]} />}
        {piece.type === 'END' && <View style={[styles.endNode, dynamicSize.endNode, piece.isConnected && styles.endNodeConnected]} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Pipeline Puzzle</Text>
      <Text style={styles.subtitle}>{gameFinished ? "You win!" : `Stage ${currentStage} of 3`}</Text>
      
      <View style={[styles.gridContainer, { opacity: (stageWon || gameFinished) ? 0.7 : 1.0 }]}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => renderCell(cell, r, c))}
          </View>
        ))}
      </View>
      
      {gameFinished && <Text style={styles.winText}>You Win!</Text>}

      <TouchableOpacity style={styles.button} onPress={resetGame}>
        <Text style={styles.buttonText}>{gameFinished ? "Play Again" : "New Game"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  gridContainer: {
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden', // Ensures rounded corners clip children
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    // Width and Height are now dynamic
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pipeCenter: {
    // Width and Height are now dynamic
    backgroundColor: '#888',
    borderRadius: 2,
  },
  pipeStub: {
    position: 'absolute',
    backgroundColor: '#888',
  },
  pipeStubTop: {
    // Dimensions are now dynamic
    top: 0,
  },
  pipeStubBottom: {
    // Dimensions are now dynamic
    bottom: 0,
  },
  pipeStubLeft: {
    // Dimensions are now dynamic
    left: 0,
  },
  pipeStubRight: {
    // Dimensions are now dynamic
    right: 0,
  },
  pipeConnected: {
    backgroundColor: '#007bff', // Blue for connected
  },
  startNode: {
    // Dimensions are now dynamic
    backgroundColor: '#007bff',
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  endNode: {
    // Dimensions are now dynamic
    backgroundColor: '#dc3545', // Red
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  endNodeConnected: {
    backgroundColor: '#28a745', // Green when connected
  },
  button: {
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  winText: {
    position: 'absolute',
    top: '45%',
    fontSize: 48,   
    fontWeight: 'bold',
    color: '#28a745',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    transform: [{ rotate: '-10deg' }],
  },
});






