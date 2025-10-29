import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Text, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

// --- Config ---

const GRID_ROWS = 5;
const GRID_COLS = 5;
const START_POS = { r: 0, c: 0 };
const END_POS = { r: 4, c: 4 };

// Get screen width to make grid responsive
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
// Base grid size on the smaller dimension to keep it square
// Use 90% of width or 70% of height, whichever is smaller, to leave room for text/button
const gameAreaSize = Math.min(windowWidth * 0.9, windowHeight * 0.7);
const CELL_SIZE = Math.floor(gameAreaSize / GRID_COLS);

const PIPE_WIDTH = Math.floor(CELL_SIZE * 0.2); // Width of the pipe
const PIPE_CENTER_SIZE = PIPE_WIDTH;
const PIPE_STUB_LENGTH = Math.floor((CELL_SIZE - PIPE_WIDTH) / 2);

// --- Game Logic ---

/**
 * Defines the initial level.
 * A real game would have a level generator or a list of pre-defined levels.
 */
const createInitialLevel = () => {
  const grid = Array(GRID_ROWS).fill(null).map(() => 
    Array(GRID_COLS).fill(null).map(() => ({
      type: Math.random() > 0.5 ? 'STRAIGHT' : 'L_BEND',
      rotation: Math.floor(Math.random() * 4), // 0, 1, 2, 3
      isConnected: false,
      isFixed: false,
    }))
  );

  // --- This is our hard-coded solution path ---
  // START -> R -> R -> B -> B -> R -> T -> T -> R -> END
  // For simplicity, let's make a simpler 5x5 path
  // (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) -> (2,3) -> (2,4) -> (3,4) -> (4,4)
  grid[0][0] = { type: 'START', rotation: 1, isFixed: true }; // Opens Right
  grid[0][1] = { type: 'STRAIGHT', rotation: 1, isFixed: false }; // L-R
  grid[0][2] = { type: 'L_BEND', rotation: 1, isFixed: false }; // R-B
  grid[1][2] = { type: 'STRAIGHT', rotation: 0, isFixed: false }; // T-B
  grid[2][2] = { type: 'L_BEND', rotation: 0, isFixed: false }; // T-R
  grid[2][3] = { type: 'STRAIGHT', rotation: 1, isFixed: false }; // L-R
  grid[2][4] = { type: 'L_BEND', rotation: 3, isFixed: false }; // L-T
  grid[3][4] = { type: 'STRAIGHT', rotation: 0, isFixed: false }; // T-B
  grid[4][4] = { type: 'END', rotation: 0, isFixed: true }; // Opens Top

  // Randomize rotations for non-path pieces
  grid[0][1].rotation = 0;
  grid[0][2].rotation = 3;
  grid[1][2].rotation = 1;
  grid[2][2].rotation = 2;
  grid[2][3].rotation = 0;
  grid[2][4].rotation = 1;
  grid[3][4].rotation = 1;
  
  // Set isConnected for the start piece
  grid[START_POS.r][START_POS.c].isConnected = true;
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
      return []; // Default for 'START' (in image, it's 'RIGHT')
      
    case 'END':
      // 0:T, 1:R, 2:B, 3:L
      if (rotation === 0) return ['TOP'];
      if (rotation === 1) return ['RIGHT'];
      if (rotation === 2) return ['BOTTOM'];
      if (rotation === 3) return ['LEFT'];
      return []; // Default for 'END' (in image, it's 'LEFT')

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
  const [grid, setGrid] = useState(createInitialLevel);
  const [gameWon, setGameWon] = useState(false);

  /**
   * Main game logic.
   * Checks all connections from the START node using BFS.
   */
  const checkConnections = (currentGrid) => {
    // 1. Create a new grid and reset all 'isConnected'
    const newGrid = currentGrid.map(row => 
      row.map(cell => ({ ...cell, isConnected: false }))
    );

    let win = false;
    const q = [START_POS]; // Queue for BFS
    const visited = new Set([`${START_POS.r},${START_POS.c}`]);
    newGrid[START_POS.r][START_POS.c].isConnected = true;

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
        if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) {
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

    setGrid(newGrid);
    if (win && !gameWon) {
      setGameWon(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Pipeline Connected!", "You win!", [{ text: "OK" }]);
    }
  };

  /**
   * Handle user tap on a pipe.
   */
  const handlePress = (r, c) => {
    if (gameWon || grid[r][c].isFixed) {
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

    // Set the state, and then check connections in the callback
    setGrid(newGrid);
  };

  /**
   * Reset the game.
   */
  const resetGame = () => {
    setGameWon(false);
    setGrid(createInitialLevel());
  };

  // This useEffect triggers the connection check *after* the state has updated
  useEffect(() => {
    if (!gameWon) {
      checkConnections(grid);
    }
  }, [grid]); // Re-run whenever the grid changes

  // --- Render ---

  /**
   * Renders a single pipe cell.
   */
  const renderCell = (piece, r, c) => {
    if (!piece) return <View style={styles.cell} />;

    const openings = getOpenings(piece);
    const has = (dir) => openings.includes(dir);
    const connectedStyle = piece.isConnected ? styles.pipeConnected : null;

    return (
      <TouchableOpacity
        key={`${r}-${c}`}
        style={styles.cell}
        onPress={() => handlePress(r, c)}
        activeOpacity={0.7}
      >
        {/* Center */}
        {piece.type !== 'START' && piece.type !== 'END' && (
          <View style={[styles.pipeCenter, connectedStyle]} />
        )}

        {/* Stubs */}
        {has('TOP') && <View style={[styles.pipeStub, styles.pipeStubTop, connectedStyle]} />}
        {has('BOTTOM') && <View style={[styles.pipeStub, styles.pipeStubBottom, connectedStyle]} />}
        {has('LEFT') && <View style={[styles.pipeStub, styles.pipeStubLeft, connectedStyle]} />}
        {has('RIGHT') && <View style={[styles.pipeStub, styles.pipeStubRight, connectedStyle]} />}

        {/* Start/End Nodes */}
        {piece.type === 'START' && <View style={styles.startNode} />}
        {piece.type === 'END' && <View style={[styles.endNode, piece.isConnected && styles.endNodeConnected]} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pipeline Puzzle</Text>
      <Text style={styles.subtitle}>Connect the pipes!</Text>
      
      <View style={[styles.gridContainer, { opacity: gameWon ? 0.7 : 1.0 }]}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => renderCell(cell, r, c))}
          </View>
        ))}
      </View>
      
      {gameWon && <Text style={styles.winText}>You Win!</Text>}

      <TouchableOpacity style={styles.button} onPress={resetGame}>
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pipeCenter: {
    width: PIPE_CENTER_SIZE,
    height: PIPE_CENTER_SIZE,
    backgroundColor: '#888',
    borderRadius: 2,
  },
  pipeStub: {
    position: 'absolute',
    backgroundColor: '#888',
  },
  pipeStubTop: {
    width: PIPE_WIDTH,
    height: PIPE_STUB_LENGTH,
    top: 0,
  },
  pipeStubBottom: {
    width: PIPE_WIDTH,
    height: PIPE_STUB_LENGTH,
    bottom: 0,
  },
  pipeStubLeft: {
    width: PIPE_STUB_LENGTH,
    height: PIPE_WIDTH,
    left: 0,
  },
  pipeStubRight: {
    width: PIPE_STUB_LENGTH,
    height: PIPE_WIDTH,
    right: 0,
  },
  pipeConnected: {
    backgroundColor: '#007bff', // Blue for connected
  },
  startNode: {
    width: CELL_SIZE * 0.5,
    height: CELL_SIZE * 0.5,
    borderRadius: CELL_SIZE * 0.25,
    backgroundColor: '#007bff',
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  endNode: {
    width: CELL_SIZE * 0.5,
    height: CELL_SIZE * 0.5,
    borderRadius: CELL_SIZE * 0.25,
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

