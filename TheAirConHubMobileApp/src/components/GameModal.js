// src/components/GameModal.js

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import {
  Sparkles,
  X,
  Gamepad2,
  Play,
  Dices,
  Wrench,
  Search,
  CloudOff,
} from "lucide-react-native";
import IPipe from "../../assets/ipipe.png";
import CrossPipe from "../../assets/crosspipe.png";
import LPipe from "../../assets/lpipe.png";
import { styles } from "../styles/AppStyles";

//region Tap Challenge
const TapChallengeGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });

  const startGame = () => {
    setScore(0);
    setGameActive(true);
    moveTarget();
  };

  const moveTarget = () => {
    setTargetPosition({
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 15,
    });
  };

  const handleTargetPress = () => {
    const newScore = score + 10;
    setScore(newScore);
    moveTarget();

    if (newScore >= 100) {
      setGameActive(false);
      if (!isPracticeMode) {
        onEarnPoints(newScore);
      }
    }
  };

  return (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>Tap Challenge!</Text>
      <Text style={styles.gameSubtitle}>
        Tap the target 10 times to earn {isPracticeMode ? "no" : "100"} points
      </Text>

      {!gameActive ? (
        <>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Game"}
            </Text>
          </TouchableOpacity>
          {score > 0 && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                {isPracticeMode
                  ? "Practice Complete!"
                  : `+${score} points earned! 🎉`}
              </Text>
              <TouchableOpacity
                style={styles.backToHubButton}
                onPress={onEndGame}
              >
                <Text style={styles.backToHubButtonText}>Back to Games</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score} pts</Text>
          </View>
          <TouchableOpacity
            onPress={handleTargetPress}
            style={[
              styles.target,
              {
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
              },
            ]}
          >
            <Sparkles size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
// endregion

// region Broken Pipeline
const PIPE_TYPES = [
  {
    rotations: [0, 90],
    image: IPipe,
    style: { borderWidth: 0, borderTopWidth: 4, borderBottomWidth: 4 },
  }, // I-Pipe
  {
    rotations: [0, 90, 180, 270],
    image: CrossPipe,
    style: { borderWidth: 4 },
  }, // Cross-Pipe
  {
    rotations: [0, 90, 180, 270],
    image: LPipe,
    style: { borderTopWidth: 4, borderRightWidth: 4 },
  }, // L-Pipe (Corner)
];
const GRID_SIZE = 4;
const WINNING_SCORE = 50;

const START_INDEX = 0; // Top-Left corner
const END_INDEX = GRID_SIZE * GRID_SIZE - 1; // Bottom-Right corner

// Helper to check if a specific connection is active on a tile based on its rotation
const hasConnection = (tile, direction) => {
  const rotation = tile.rotation;
  const typeIndex = tile.typeIndex;

  // I-Pipe (index 0)
  if (typeIndex === 0) {
    if (rotation === 0 || rotation === 180) {
      const result = direction === "T" || direction === "B";
      console.log(`    I-Pipe (rot ${rotation}): ${direction} = ${result}`);
      return result;
    }
    if (rotation === 90 || rotation === 270) {
      const result = direction === "L" || direction === "R";
      console.log(`    I-Pipe (rot ${rotation}): ${direction} = ${result}`);
      return result;
    }
  }

  // Cross-Pipe (index 1)
  if (typeIndex === 1) {
    console.log(`    Cross-Pipe: ${direction} = true (all directions)`);
    return true;
  }

  // L-Pipe logic (index 2)
  if (typeIndex === 2) {
    let result = false;
    if (rotation === 0) result = direction === "T" || direction === "R";
    else if (rotation === 90) result = direction === "R" || direction === "B";
    else if (rotation === 180) result = direction === "B" || direction === "L";
    else if (rotation === 270) result = direction === "L" || direction === "T";
    console.log(`    L-Pipe (rot ${rotation}): ${direction} = ${result}`);
    return result;
  }

  console.log(`    Unknown pipe type ${typeIndex}: ${direction} = false`);
  return false;
};

// CORE PATHFINDING FUNCTION
const isPathConnected = (currentGrid) => {
  const visited = new Array(currentGrid.length).fill(false);
  const queue = [START_INDEX];
  visited[START_INDEX] = true;

  console.log('=== PATHFINDING DEBUG ===');
  console.log('Starting pathfinding from index:', START_INDEX);
  console.log('Target end index:', END_INDEX);

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentTile = currentGrid[currentIndex];
    
    console.log(`Checking tile ${currentIndex}:`, {
      typeIndex: currentTile.typeIndex,
      rotation: currentTile.rotation,
      row: Math.floor(currentIndex / GRID_SIZE),
      col: currentIndex % GRID_SIZE
    });
    
    if (currentIndex === END_INDEX) {
      console.log('✅ PATH FOUND! Reached the end!');
      return true; // Path found!
    }

    const row = Math.floor(currentIndex / GRID_SIZE);
    const col = currentIndex % GRID_SIZE;

    const neighbors = [
      {
        index: currentIndex - GRID_SIZE,
        direction: "T",
        requiredNeighborConnection: "B",
      }, // Top
      {
        index: currentIndex + GRID_SIZE,
        direction: "B",
        requiredNeighborConnection: "T",
      }, // Bottom
      {
        index: currentIndex + 1,
        direction: "R",
        requiredNeighborConnection: "L",
      }, // Right
      {
        index: currentIndex - 1,
        direction: "L",
        requiredNeighborConnection: "R",
      }, // Left
    ];

    for (const {
      index: neighborIndex,
      direction,
      requiredNeighborConnection,
    } of neighbors) {
      // Check if neighbor index is valid (0 to 15)
      if (neighborIndex < 0 || neighborIndex >= currentGrid.length) {
        continue;
      }

      // Prevent horizontal wrapping
      if (direction === "R" && col === GRID_SIZE - 1) {
        continue;
      }
      if (direction === "L" && col === 0) {
        continue;
      }

      if (!visited[neighborIndex]) {
        const neighborTile = currentGrid[neighborIndex];
        const currentConnects = hasConnection(currentTile, direction);
        const neighborConnects = hasConnection(
          neighborTile,
          requiredNeighborConnection
        );

        console.log(`  Checking neighbor ${neighborIndex} (${direction}):`, {
          currentConnects,
          neighborConnects,
          neighborType: neighborTile.typeIndex,
          neighborRotation: neighborTile.rotation
        });

        if (currentConnects && neighborConnects) {
          console.log(`  ✅ Connected to tile ${neighborIndex}`);
          visited[neighborIndex] = true;
          queue.push(neighborIndex);
        } else {
          console.log(`  ❌ Not connected to tile ${neighborIndex}`);
        }
      }
    }
  }

  console.log('❌ NO PATH FOUND');
  return false; // No path found
};

const createInitialGrid = () => {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => {
    const typeIndex = Math.floor(Math.random() * PIPE_TYPES.length);
    const type = PIPE_TYPES[typeIndex];
    const randomRotation =
      type.rotations[Math.floor(Math.random() * type.rotations.length)];

    return {
      typeIndex: typeIndex,
      rotation: randomRotation,
    };
  });
};

// Helper to create a SOLVABLE grid
const createSolvableGrid = () => {
  const grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
    typeIndex: 0,
    rotation: 0,
  }));

  // Step 1: Create a guaranteed path from START to END
  const path = [];
  let current = START_INDEX;
  path.push(current);

  // Simple path algorithm: move right and down randomly
  while (current !== END_INDEX) {
    const row = Math.floor(current / GRID_SIZE);
    const col = current % GRID_SIZE;
    
    const canGoRight = col < GRID_SIZE - 1;
    const canGoDown = row < GRID_SIZE - 1;
    
    if (!canGoRight && !canGoDown) break; // Shouldn't happen
    
    let nextMove;
    if (!canGoRight) {
      nextMove = 'down';
    } else if (!canGoDown) {
      nextMove = 'right';
    } else {
      // Randomly choose
      nextMove = Math.random() < 0.5 ? 'right' : 'down';
    }
    
    if (nextMove === 'right') {
      current = current + 1;
    } else {
      current = current + GRID_SIZE;
    }
    
    path.push(current);
  }

  // Step 2: Place correct pipes along the path
  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    
    const prevIndex = i > 0 ? path[i - 1] : null;
    const nextIndex = i < path.length - 1 ? path[i + 1] : null;
    
    // Determine which directions we need to connect
    let needsTop = false, needsBottom = false, needsLeft = false, needsRight = false;
    
    if (prevIndex !== null) {
      if (prevIndex === index - GRID_SIZE) needsTop = true;
      if (prevIndex === index + GRID_SIZE) needsBottom = true;
      if (prevIndex === index - 1) needsLeft = true;
      if (prevIndex === index + 1) needsRight = true;
    }
    
    if (nextIndex !== null) {
      if (nextIndex === index - GRID_SIZE) needsTop = true;
      if (nextIndex === index + GRID_SIZE) needsBottom = true;
      if (nextIndex === index - 1) needsLeft = true;
      if (nextIndex === index + 1) needsRight = true;
    }
    
    // Choose appropriate pipe type and rotation
    const connections = [needsTop, needsRight, needsBottom, needsLeft];
    const connectionCount = connections.filter(c => c).length;
    
    if (connectionCount === 2) {
      // Check if straight or corner
      if ((needsTop && needsBottom) || (needsLeft && needsRight)) {
        // Straight pipe (I-Pipe)
        grid[index].typeIndex = 0;
        grid[index].rotation = (needsTop && needsBottom) ? 0 : 90;
      } else {
        // Corner pipe (L-Pipe)
        grid[index].typeIndex = 2;
        if (needsTop && needsRight) grid[index].rotation = 0;
        else if (needsRight && needsBottom) grid[index].rotation = 90;
        else if (needsBottom && needsLeft) grid[index].rotation = 180;
        else if (needsLeft && needsTop) grid[index].rotation = 270;
      }
    }
  }

  // Step 3: Fill remaining tiles with random pipes
  for (let i = 0; i < grid.length; i++) {
    if (!path.includes(i)) {
      const typeIndex = Math.floor(Math.random() * PIPE_TYPES.length);
      const type = PIPE_TYPES[typeIndex];
      grid[i].typeIndex = typeIndex;
      grid[i].rotation = type.rotations[Math.floor(Math.random() * type.rotations.length)];
    }
  }

  // Step 4: Scramble the path tiles (rotate them randomly but not to correct position)
  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    // Skip START and END tiles - we'll set those separately
    if (index === START_INDEX || index === END_INDEX) continue;
    
    const type = PIPE_TYPES[grid[index].typeIndex];
    const correctRotation = grid[index].rotation;
    
    // Get other possible rotations (not the correct one)
    const otherRotations = type.rotations.filter(r => r !== correctRotation);
    if (otherRotations.length > 0) {
      grid[index].rotation = otherRotations[Math.floor(Math.random() * otherRotations.length)];
    }
  }

  return grid;
};

// Helper to create a grid, but ensuring the start/end tiles are visually distinct
const createInitialGridWithStartEnd = () => {
  const grid = createSolvableGrid();

  // Set Start tile as Cross-Pipe (connects in all directions)
  grid[START_INDEX].typeIndex = 1; // Cross-Pipe
  grid[START_INDEX].rotation = 0; // Rotation doesn't matter for cross pipe

  // Set End tile as Cross-Pipe (connects in all directions)
  grid[END_INDEX].typeIndex = 1; // Cross-Pipe
  grid[END_INDEX].rotation = 0; // Rotation doesn't matter for cross pipe

  return grid;
};

const BrokenPipelineGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [grid, setGrid] = useState(createInitialGridWithStartEnd());
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);

  // Function to start a new game
  const startNewGame = () => {
    setGrid(createInitialGridWithStartEnd());
    setGameWon(false);
    setMoves(0);
  };

  // Pathfinding is now the win condition
  const checkWinCondition = useCallback(
    (currentGrid) => {
      if (isPathConnected(currentGrid)) {
        setGameWon(true);
        if (!isPracticeMode) {
          onEarnPoints(WINNING_SCORE);
        }
      }
    },
    [isPracticeMode, onEarnPoints]
  );

  const handleTilePress = (index) => {
    // Prevent rotating the fixed Start and End tiles
    if (index === START_INDEX || index === END_INDEX || gameWon) return;

    let newGrid;
    setGrid((prevGrid) => {
      newGrid = [...prevGrid];
      const tile = newGrid[index];
      const type = PIPE_TYPES[tile.typeIndex];

      const currentRotIndex = type.rotations.indexOf(tile.rotation);
      const nextRotIndex = (currentRotIndex + 1) % type.rotations.length;
      tile.rotation = type.rotations[nextRotIndex];

      return newGrid;
    });

    setMoves((prevMoves) => prevMoves + 1);
    checkWinCondition(newGrid);
  };

  const renderTile = (tile, index) => {
    const pipeType = PIPE_TYPES[tile.typeIndex];

    // Highlight start/end points
    const isStart = index === START_INDEX;
    const isEnd = index === END_INDEX;
    const tileColor = isStart ? "#FBBF24" : isEnd ? "#EF4444" : "#F9FAFB";

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.pipeTile,
          {
            backgroundColor: tileColor,
          },
        ]}
        onPress={() => handleTilePress(index)}
        disabled={gameWon || isStart || isEnd}
      >
        {pipeType.image ? (
          <Image
            source={pipeType.image}
            resizeMode="contain"
            style={[
              styles.pipeImage,
              {
                transform: [{ rotate: `${tile.rotation}deg` }],
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.pipe,
              pipeType.style,
              {
                borderColor: gameWon
                  ? "#10B981"
                  : isStart || isEnd
                  ? "#1F2937"
                  : "#3bb8f6ff",
                opacity: isStart || isEnd ? 1 : 0.8,
                transform: [{ rotate: `${tile.rotation}deg` }],
              },
            ]}
          />
        )}
        {isStart && <Text style={styles.pipeLabel}>💧</Text>}
        {isEnd && <Text style={styles.pipeLabel}>🕳️</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>Broken Pipeline</Text>
      <Text style={styles.gameSubtitle}>
        Connect the water source (💧) at the top-left to the drain (🕳️) at the
        bottom-right.
      </Text>

      {gameWon ? (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>
            Pipeline Fixed!{" "}
            {isPracticeMode
              ? "Practice Complete"
              : `+${WINNING_SCORE} points earned! 🎉`}
          </Text>
          <TouchableOpacity style={styles.backToHubButton} onPress={onEndGame}>
            <Text style={styles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.pipelineGameArea}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 15 }}>
            <Text style={styles.movesText}>Moves: {moves}</Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#6B7280', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
              onPress={startNewGame}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>New Game</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pipelineGrid}>
            {grid.map((tile, index) => renderTile(tile, index))}
          </View>
        </View>
      )}
    </View>
  );
};
// endregion

// --- Placeholder Game Component 3: Find the Leak ---
const FindTheLeakGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  // Placeholder logic for Find the Leak game
};

// --- Placeholder Game Component 4: Block the Haze ---
const BlockTheHazeGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  // Placeholder logic for Block the Haze game
};

// --- Placeholder Game Component 5: Wheel of Fortune ---
const WheelOfFortuneGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  // Placeholder logic for Wheel of Fortune game
};

// --- GameHubScreen with Grid Layout ---
const GameHubScreen = ({ games, onSelectGame, currentSlotKey }) => {
  const isPracticeMode = currentSlotKey === "practice";

  const renderGameGridItem = ({ item: game }) => (
    <TouchableOpacity
      key={game.key}
      style={styles.gameGridItem}
      onPress={() => onSelectGame(game.key)}
    >
      <View style={styles.gameGridImagePlaceholder}>
        {game.iconComponent}
      </View>
      <Text style={styles.gameGridTitle}>{game.name}</Text>
      <Text style={styles.gameGridPoints}>
        {isPracticeMode ? "Practice" : game.bonus}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.gameHubList}>
      <Text style={styles.gameHubTitle}>Choose Your Challenge</Text>
      <Text style={styles.gameHubSubtitle}>
        {isPracticeMode
          ? "Play for fun (no points)"
          : "Play to earn bonus rewards!"}
      </Text>

      <FlatList
        data={games}
        renderItem={renderGameGridItem}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.gameGridRow}
        contentContainerStyle={styles.gameGridContainer}
      />
    </View>
  );
};

const GameModal = ({ visible, onClose, onEarnPoints, initialGameKey }) => {
  const [activeGameKey, setActiveGameKey] = useState(initialGameKey || null);
  const [currentSlotKey, setCurrentSlotKey] = useState(initialGameKey || null);

  const minigames = [
    {
      name: "Wheel of Fortune",
      key: "wheel",
      bonus: "+25 Points",
      iconComponent: <Dices size={40} color="#3B82F6" />,
    },
    {
      name: "Broken Pipeline",
      key: "sequence",
      bonus: "+50 Points",
      iconComponent: <Wrench size={40} color="#3B82F6" />,
    },
    {
      name: "Find the Leak",
      key: "leak",
      bonus: "+50 Points",
      iconComponent: <Search size={40} color="#3B82F6" />,
    },
    {
      name: "Block the Haze",
      key: "block",
      bonus: "+50 Points",
      iconComponent: <CloudOff size={40} color="#3B82F6" />,
    },
    {
      name: "Quick Tap Challenge",
      key: "tap",
      bonus: "+100 Points",
      iconComponent: <Sparkles size={40} color="#3B82F6" />,
    },
  ];

  useEffect(() => {
    if (visible) {
      setActiveGameKey(null);
      setCurrentSlotKey(initialGameKey);
    } else {
      setCurrentSlotKey(null);
    }
  }, [visible, initialGameKey]);

  const renderActiveGame = () => {
    const handleEndGame = () => setActiveGameKey(null);
    const isPracticeMode = currentSlotKey === "practice";

    switch (activeGameKey) {
      case "tap":
        return (
          <TapChallengeGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "sequence":
        return (
          <BrokenPipelineGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "leak":
        return (
          <FindTheLeakGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "block":
        return (
          <BlockTheHazeGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "wheel":
        return (
          <WheelOfFortuneGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      default:
        return (
          <GameHubScreen
            games={minigames}
            onSelectGame={setActiveGameKey}
            currentSlotKey={currentSlotKey}
          />
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.gameModalContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity
            onPress={activeGameKey ? () => setActiveGameKey(null) : onClose}
            style={styles.closeButton}
          >
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.gameContent}>
          {renderActiveGame()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GameModal;