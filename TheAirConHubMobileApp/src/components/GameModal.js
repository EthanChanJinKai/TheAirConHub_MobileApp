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
} from "react-native"; // Import Image and FlatList
import {
  Sparkles,
  X,
  Gamepad2,
  Play,
  Dices,
  Wrench,
  Search,
  CloudOff,
} from "lucide-react-native"; // Add more game-specific icons
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
        // Only earn points if not in practice mode
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
  { rotations: [0, 90],
    image: IPipe,
    style: { borderWidth: 0, borderTopWidth: 4, borderBottomWidth: 4 }
  }, // I-Pipe
  { rotations: [0, 90, 180, 270],
    image: CrossPipe,
    style: { borderWidth: 4 }
  }, // Cross-Pipe
  { rotations: [0, 90, 180, 270],
    image: LPipe,
    style: { borderTopWidth: 4, borderRightWidth: 4 }
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

  // Cross-Pipe connects in all directions
  if (typeIndex === 2) {
    return true;
  }
  
  // L-Pipe logic
  if (typeIndex === 1) {
    if (rotation === 0) return direction === "T" || direction === "R";
    if (rotation === 90) return direction === "R" || direction === "B";
    if (rotation === 180) return direction === "B" || direction === "L";
    if (rotation === 270) return direction === "L" || direction === "T";
  }
  
  // I-Pipe logic
  if (typeIndex === 0) {
    if (rotation === 0 || rotation === 180)
      return direction === "T" || direction === "B";
    if (rotation === 90 || rotation === 270)
      return direction === "L" || direction === "R";
  }
  
  return false;
};

// CORE PATHFINDING FUNCTION
const isPathConnected = (currentGrid) => {
  const visited = new Array(currentGrid.length).fill(false);
  const queue = [START_INDEX];
  visited[START_INDEX] = true;

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentTile = currentGrid[currentIndex];
    if (currentIndex === END_INDEX) {
      return true; // Path found!
    }

    const row = Math.floor(currentIndex / GRID_SIZE);
    const col = currentIndex % GRID_SIZE; // Possible moves (neighbor indices and connection directions)

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
      // --- CORRECTED BOUNDARY CHECK LOGIC ---
      // 1. Check if neighbor index is valid (0 to 15)
      if (neighborIndex < 0 || neighborIndex >= currentGrid.length) {
        continue;
      }

      // 2. Prevent horizontal wrapping (e.g., index 3 trying to connect to index 4 via 'R')
      // Right move check: If current column is the right edge (col 3) AND the direction is 'R', skip.
      if (direction === "R" && col === GRID_SIZE - 1) {
        continue;
      }
      // Left move check: If current column is the left edge (col 0) AND the direction is 'L', skip.
      if (direction === "L" && col === 0) {
        continue;
      }
      // --- END CORRECTED BOUNDARY CHECK LOGIC ---
      if (!visited[neighborIndex]) {
        const neighborTile = currentGrid[neighborIndex]; // 1. Check if the current tile connects to the neighbor
        const currentConnects = hasConnection(currentTile, direction); // 2. Check if the neighbor tile connects back to the current tile
        const neighborConnects = hasConnection(
          neighborTile,
          requiredNeighborConnection
        );

        if (currentConnects && neighborConnects) {
          visited[neighborIndex] = true;
          queue.push(neighborIndex);
        }
      }
    }
  }

  return false; // No path found
};

const createInitialGrid = () => {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => {
    const typeIndex = Math.floor(Math.random() * PIPE_TYPES.length);
    const type = PIPE_TYPES[typeIndex];
    const randomRotation = type.rotations[Math.floor(Math.random() * type.rotations.length)];
    
    return {
      typeIndex: typeIndex,
      rotation: randomRotation
    };
  });
};

// Helper to create a grid, but ensuring the start/end tiles are visually distinct
const createInitialGridWithStartEnd = () => {
  const grid = createInitialGrid();

  // Ensure the Start and End tiles are L-pipes for a clear visual boundary
  grid[START_INDEX].typeIndex = 1;
  grid[END_INDEX].typeIndex = 1;

  // Lock the rotation of Start/End tiles for a clean visual target
  grid[START_INDEX].rotation = 90; // Exiting Right/Bottom
  grid[END_INDEX].rotation = 270; // Accepting Top/Left (inverted L)

  return grid;
};

const BrokenPipelineGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  // Use the new grid initialization function
  const [grid, setGrid] = useState(createInitialGridWithStartEnd());
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);

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
    // Check win condition immediately after state update (using local copy for speed)
    checkWinCondition(newGrid);
  };

  const renderTile = (tile, index) => {
    const pipeType = PIPE_TYPES[tile.typeIndex]; // Changed from pipeStyle to pipeType

    // Highlight start/end points
    const isStart = index === START_INDEX;
    const isEnd = index === END_INDEX;
    const tileColor = isStart ? "#FBBF24" : isEnd ? "#EF4444" : "#F9FAFB"; // Yellow start, Red end

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
        disabled={gameWon || isStart || isEnd} // Lock Start/End Tiles
      >
        {pipeType.image ? (
          <Image
            source={pipeType.image}
            style={[
              styles.pipeImage,
              {
                transform: [{ rotate: `${tile.rotation}deg` }],
                tintColor: gameWon ? "#10B981" : isStart || isEnd ? "#1F2937" : "#3B82F6",
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
                  : "#3B82F6",
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
          <Text style={styles.movesText}>Moves: {moves}</Text>
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
  // Determine if the current slot is a practice slot
  const isPracticeMode = currentSlotKey === "practice";

  const renderGameGridItem = ({ item: game }) => (
    <TouchableOpacity
      key={game.key}
      style={styles.gameGridItem}
      onPress={() => onSelectGame(game.key)}
    >
      {/* Placeholder for Game Image (replace with actual image later) */}
      <View style={styles.gameGridImagePlaceholder}>
        {/* You'd replace this with <Image source={game.image} style={styles.gameGridImage} /> */}
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
        numColumns={2} // Grid with 2 columns
        columnWrapperStyle={styles.gameGridRow} // Style for rows
        contentContainerStyle={styles.gameGridContainer} // Container for the grid
      />
    </View>
  );
};
// -------------------------------------------------------------------------

const GameModal = ({ visible, onClose, onEarnPoints, initialGameKey }) => {
  const [activeGameKey, setActiveGameKey] = useState(initialGameKey || null);
  // Store the initial slot key to pass down to games (for practice mode checks)
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
      setActiveGameKey(null); // Always start at the hub when modal opens
      setCurrentSlotKey(initialGameKey); // Set the current slot key
    } else {
      setCurrentSlotKey(null); // Clear slot key when modal closes
    }
  }, [visible, initialGameKey]);

  const renderActiveGame = () => {
    const handleEndGame = () => setActiveGameKey(null); // Return to the Hub
    // Check if the current slot is practice mode to pass down to game components
    const isPracticeMode = currentSlotKey === "practice";

    switch (activeGameKey) {
      case "tap":
        return (
          <TapChallengeGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)} // Pass slot key with points
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode} // Pass practice mode status
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

      // You would add more cases here for your other games:
      // case 'wheel': return <WheelOfFortuneGame onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      // case 'sequence': return <BrokenPipelineGame onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      // ...
      default:
        return (
          <GameHubScreen
            games={minigames}
            onSelectGame={setActiveGameKey}
            currentSlotKey={currentSlotKey} // Pass current slot key to the hub
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
