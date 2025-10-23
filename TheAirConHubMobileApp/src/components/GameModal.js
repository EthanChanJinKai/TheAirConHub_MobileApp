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
  Dimensions,
  Platform
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
  RotateCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import Svg, { Path, Line, Circle } from "react-native-svg";
import Slider from "@react-native-community/slider";
import IPipe from "../../assets/ipipe.png";
import CrossPipe from "../../assets/crosspipe.png";
import LPipe from "../../assets/lpipe.png";
import EntrancePipe from "../../assets/entrancepipe.png";
import ExitPipe from "../../assets/exitpipe.png";
import { styles } from "../styles/AppStyles";

// region Responsive design helpers
const { width, height } = Dimensions.get("window");
const isDesktop = width >= 768;
const isMobile = width < 768;

const getResponsiveStyles = () => {
  if (isDesktop) {
    return {
      // Desktop styles
      waveWidth: 400,
      waveHeight: 120,
      headerPadding: 12,
      headerFontSize: 20,
      sectionMargin: 15,
      controlsPadding: 20,
      knobWidth: '40%',
      buttonPaddingVertical: 15,
      buttonFontSize: 18,
      statusPadding: 12,
      titleFontSize: 18,
    };
  } else {
    return {
      // Mobile styles
      waveWidth: 300,
      waveHeight: 100,
      headerPadding: 8,
      headerFontSize: 18,
      sectionMargin: 10,
      controlsPadding: 15,
      knobWidth: '45%',
      buttonPaddingVertical: 12,
      buttonFontSize: 16,
      statusPadding: 10,
      titleFontSize: 16,
    };
  }
};
// endregion

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
  const rotation = tile.rotation % 180;
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

  console.log("=== PATHFINDING DEBUG ===");
  console.log("Starting pathfinding from index:", START_INDEX);
  console.log("Target end index:", END_INDEX);

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentTile = currentGrid[currentIndex];

    console.log(`Checking tile ${currentIndex}:`, {
      typeIndex: currentTile.typeIndex,
      rotation: currentTile.rotation,
      row: Math.floor(currentIndex / GRID_SIZE),
      col: currentIndex % GRID_SIZE,
    });

    if (currentIndex === END_INDEX) {
      console.log("✅ PATH FOUND! Reached the end!");
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
          neighborRotation: neighborTile.rotation,
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

  console.log("❌ NO PATH FOUND");
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
      nextMove = "down";
    } else if (!canGoDown) {
      nextMove = "right";
    } else {
      // Randomly choose
      nextMove = Math.random() < 0.5 ? "right" : "down";
    }

    if (nextMove === "right") {
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
    let needsTop = false,
      needsBottom = false,
      needsLeft = false,
      needsRight = false;

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
    const connectionCount = connections.filter((c) => c).length;

    if (connectionCount === 2) {
      // Check if straight or corner
      if ((needsTop && needsBottom) || (needsLeft && needsRight)) {
        // Straight pipe (I-Pipe)
        grid[index].typeIndex = 0;
        grid[index].rotation = needsTop && needsBottom ? 0 : 90;
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
      grid[i].rotation =
        type.rotations[Math.floor(Math.random() * type.rotations.length)];
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
    const otherRotations = type.rotations.filter((r) => r !== correctRotation);
    if (otherRotations.length > 0) {
      grid[index].rotation =
        otherRotations[Math.floor(Math.random() * otherRotations.length)];
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
        {/* Special rendering for START tile */}
        {isStart ? (
          <>
            <Image
              source={EntrancePipe}
              resizeMode="contain"
              style={styles.pipeImage}
            />
            {/* <Text style={styles.pipeLabel}>💧</Text> */}
          </>
        ) : /* Special rendering for END tile */
        isEnd ? (
          <>
            <Image
              source={ExitPipe}
              resizeMode="contain"
              style={styles.pipeImage}
            />
            {/* <Text style={styles.pipeLabel}>🕳️</Text> */}
          </>
        ) : /* Normal pipe rendering */
        pipeType.image ? (
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
                borderColor: gameWon ? "#10B981" : "#3bb8f6ff",
                opacity: 0.8,
                transform: [{ rotate: `${tile.rotation}deg` }],
              },
            ]}
          />
        )}
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 15,
            }}
          >
            <Text style={styles.movesText}>Moves: {moves}</Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#6B7280",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
              onPress={startNewGame}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                New Game
              </Text>
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

//region Find the Leak
const GasTypes = {
  NATURAL_GAS: {
    name: "Natural Gas",
    color: "#3b82f6",
    hazard: "High",
    repair: "Pipe seal + ventilation",
    frequency: 2.0,
    amplitude: 3.0,
  },
  PROPANE: {
    name: "Propane",
    color: "#f59e0b",
    hazard: "Critical",
    repair: "Tank replacement + valve",
    frequency: 3.5,
    amplitude: 2.5,
  },
  CARBON_MONOXIDE: {
    name: "Carbon Monoxide",
    color: "#ef4444",
    hazard: "Extreme",
    repair: "Source isolation + alarm",
    frequency: 1.5,
    amplitude: 4.0,
  },
  METHANE: {
    name: "Methane",
    color: "#10b981",
    hazard: "Moderate",
    repair: "Leak patch + monitor",
    frequency: 2.8,
    amplitude: 3.5,
  },
};

const SineWaveDisplay = ({ frequency, amplitude, color, label, isTarget }) => {
  const responsiveStyles = getResponsiveStyles();
  const points = 150;
  const width = responsiveStyles.waveWidth;
  const height = responsiveStyles.waveHeight;
  const centerY = height / 2;

  const pathData = Array.from({ length: points }, (_, i) => {
    const x = (i / points) * Math.PI * 4;
    const y = Math.sin(x * frequency) * (amplitude * 8);
    const svgX = (i / points) * width;
    const svgY = centerY - y;
    return `${i === 0 ? "M" : "L"} ${svgX} ${svgY}`;
  }).join(" ");

  return (
    <View
      style={[
        styles.sineWaveContainer,
        isTarget && styles.sineWaveTargetBorder,
      ]}
    >
      <Text style={styles.sineWaveLabel}>{label}</Text>
      <View style={styles.sineWaveBackground}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <Line
            x1="0"
            y1={centerY}
            x2={width}
            y2={centerY}
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          {[1, 2, 3].map((i) => (
            <Line
              key={i}
              x1="0"
              y1={centerY - i * 20}
              x2={width}
              y2={centerY - i * 20}
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}
          {[1, 2, 3].map((i) => (
            <Line
              key={i}
              x1="0"
              y1={centerY + i * 20}
              x2={width}
              y2={centerY + i * 20}
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}
          {/* Sine wave */}
          <Path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
};

const Knob = ({ label, value, min, max, step, onChange, unit }) => {
  // Use a simplified visual component instead of the complex div-based web knob
  return (
    <View style={styles.knobControl}>
      <Text style={styles.knobLabel}>{label}</Text>
      <View style={styles.knobSliderContainer}>
        <Slider
          style={styles.knobSlider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#6B7280"
          thumbTintColor="#3B82F6"
        />
      </View>
      <Text style={styles.knobValue}>
        {value.toFixed(1)}
        {unit}
      </Text>
      <Text style={styles.knobRange}>
        {min} - {max}
        {unit}
      </Text>
    </View>
  );
};

const FindTheLeakGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const responsiveStyles = getResponsiveStyles();
  const [gameState, setGameState] = useState("ready");
  const [currentGas, setCurrentGas] = useState(null);
  const [userFrequency, setUserFrequency] = useState(2.0);
  const [userAmplitude, setUserAmplitude] = useState(3.0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [matchQuality, setMatchQuality] = useState(0);

  const gasArray = Object.values(GasTypes);
  const WINNING_SCORE = 100; // per round

  const calculateMatch = useCallback(() => {
    if (!currentGas) return 0;

    const freqDiff = Math.abs(currentGas.frequency - userFrequency);
    const ampDiff = Math.abs(currentGas.amplitude - userAmplitude);

    // Tolerance thresholds
    const freqTolerance = 0.2;
    const ampTolerance = 0.3;

    const freqMatch = Math.max(0, 100 - (freqDiff / freqTolerance) * 100);
    const ampMatch = Math.max(0, 100 - (ampDiff / ampTolerance) * 100);

    return Math.floor((freqMatch + ampMatch) / 2);
  }, [currentGas, userFrequency, userAmplitude]);

  useEffect(() => {
    if (gameState === "playing") {
      const quality = calculateMatch();
      setMatchQuality(quality);
    }
  }, [userFrequency, userAmplitude, currentGas, gameState, calculateMatch]);

  const startNewRound = () => {
    const target = gasArray[Math.floor(Math.random() * gasArray.length)];

    setCurrentGas(target);
    setUserFrequency(2.5); // Reset to a neutral starting point
    setUserAmplitude(3.5);
    setGameState("playing");
    setMatchQuality(0);
  };

  const handleLock = () => {
    if (gameState !== "playing") return;

    const quality = calculateMatch();

    if (quality >= 90) {
      setGameState("correct");
      const roundScore = WINNING_SCORE + Math.max(0, quality - 90) * 5;
      setScore((s) => s + roundScore);

      if (!isPracticeMode) {
        onEarnPoints(roundScore);
      }

      setTimeout(() => {
        if (round < 3) {
          // Reduced rounds for testing
          setRound(round + 1);
          startNewRound();
        } else {
          setGameState("gameover");
        }
      }, 1500);
    } else {
      setGameState("wrong");
      setTimeout(() => setGameState("playing"), 1000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setGameState("ready");
  };

  // --- RENDERING LOGIC ---

  if (gameState === "ready") {
    return (
      <View style={styles.gameCard}>
        <View style={styles.leakGameReadyContainer}>
          <RotateCw size={50} color="#3B82F6" style={styles.leakGameIcon} />
          <Text style={styles.gameTitle}>Odor Signature Match</Text>
          <Text style={styles.gameSubtitle}>
            Calibrate your detector by matching the target waveform using the
            frequency and amplitude controls.
          </Text>
          <View style={styles.leakGameHowTo}>
            <Text style={styles.leakGameHowToTitle}>How to Play:</Text>
            <Text style={styles.leakGameHowToText}>
              • Adjust frequency and amplitude controls.
            </Text>
            <Text style={styles.leakGameHowToText}>
              • Match the target waveform exactly.
            </Text>
            <Text style={styles.leakGameHowToText}>
              • Lock in when match quality ≥ 90%.
            </Text>
            <Text style={styles.leakGameHowToText}>
              • Complete 3 rounds to finish.
            </Text>
          </View>
          <TouchableOpacity
            onPress={startNewRound}
            style={styles.leakGameStartButton}
          >
            <Text style={styles.leakGameStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Calibration"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === "gameover") {
    return (
      <View style={styles.gameCard}>
        <View style={styles.leakGameOverContainer}>
          <CheckCircle size={50} color="#10B981" style={styles.leakGameIcon} />
          <Text style={styles.gameTitle}>Calibration Complete</Text>
          <Text style={styles.leakGameFinalScore}>{score}</Text>
          <Text style={styles.gameSubtitle}>Final Score</Text>
          <TouchableOpacity
            onPress={resetGame}
            style={styles.leakGameStartButton}
          >
            <Text style={styles.leakGameStartButtonText}>New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backToHubButton, { marginTop: 10 }]}
            onPress={onEndGame}
          >
            <Text style={styles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active Game State
  const matchColor =
    matchQuality >= 90 ? "#10B981" : matchQuality >= 70 ? "#F59E0B" : "#EF4444";

  return (
    <View style={styles.gameCard}>
      {/* Header with responsive padding */}
      <View style={[
        styles.leakGameHeader,
        { padding: responsiveStyles.headerPadding }
      ]}>
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Round</Text>
          <Text style={[
            styles.leakGameHeaderValue,
            { fontSize: responsiveStyles.headerFontSize }
          ]}>
            {round}/{3}
          </Text>
        </View>
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Score</Text>
          <Text style={[styles.leakGameHeaderValue, { color: "#3B82F6" }]}>
            {score}
          </Text>
        </View>
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Match Quality</Text>
          <Text style={[styles.leakGameHeaderValue, { color: matchColor }]}>
            {matchQuality}%
          </Text>
        </View>
      </View>

      {/* Status Messages */}
      {gameState === "correct" && (
        <View style={[
          styles.leakGameSuccessMessage,
          { 
            padding: responsiveStyles.statusPadding,
            marginBottom: responsiveStyles.sectionMargin 
          }
          ]}>
          <CheckCircle size={24} color="#A7F3D0" />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.leakGameStatusTitle}>Perfect Match!</Text>
            <Text style={styles.leakGameStatusText}>
              {currentGas.name} identified - {currentGas.hazard} Hazard -
              Repair: {currentGas.repair}
            </Text>
          </View>
        </View>
      )}

      {gameState === "wrong" && (
        <View style={styles.leakGameWarningMessage}>
          <AlertCircle size={24} color="#FCD34D" />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.leakGameStatusTitle}>
              Match Quality Too Low
            </Text>
            <Text style={styles.leakGameStatusText}>
              Need ≥90% match to lock in. Keep adjusting!
            </Text>
          </View>
        </View>
      )}

      {gameState === "playing" && (
        <View style={{ height: 10 }} /> // Spacer
      )}

      {/* Target Waveform */}
      {currentGas && (
        <View style={styles.leakGameSection}>
          <SineWaveDisplay
            frequency={currentGas.frequency}
            amplitude={currentGas.amplitude}
            color={currentGas.color}
            label={`TARGET: ${currentGas.name} Signature`}
            isTarget={true}
          />
        </View>
      )}

      {/* User Waveform */}
      <View style={styles.leakGameSection}>
        <SineWaveDisplay
          frequency={userFrequency}
          amplitude={userAmplitude}
          color="#9ca3af"
          label="YOUR CALIBRATION"
          isTarget={false}
        />
      </View>

      {/* Controls */}
      <View style={[
        styles.leakGameControlsContainer,
        { padding: responsiveStyles.controlsPadding }
      ]}>
        <Text style={[
          styles.leakGameControlsTitle,
          { fontSize: responsiveStyles.titleFontSize }
        ]}>
          Calibration Controls
        </Text>
        <View style={styles.leakGameKnobRow}>
          <View style={{ width: responsiveStyles.knobWidth }}>
            <Knob
              label="FREQUENCY"
              value={userFrequency}
              min={1.0}
              max={4.0}
              step={0.1}
              onChange={setUserFrequency}
              unit=" Hz"
            />
          </View>
          <View style={{ width: responsiveStyles.knobWidth }}>
            <Knob
              label="AMPLITUDE"
              value={userAmplitude}
              min={1.5}
              max={5.0}
              step={0.1}
              onChange={setUserAmplitude}
              unit=""
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLock}
          disabled={gameState !== "playing" || matchQuality < 90}
          style={[
            styles.leakGameLockButton,
            { paddingVertical: responsiveStyles.buttonPaddingVertical },
            matchQuality >= 90
              ? styles.leakGameLockButtonActive
              : styles.leakGameLockButtonInactive,
          ]}
        >
          <Text style={[
            styles.leakGameLockButtonText,
            { fontSize: responsiveStyles.buttonFontSize }
          ]}>
            {matchQuality >= 90
              ? "🔒 LOCK SIGNATURE"
              : `MATCH ${matchQuality}% (Need ≥90%)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

//endregion

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
      <View style={styles.gameGridImagePlaceholder}>{game.iconComponent}</View>
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

        <ScrollView contentContainerStyle={styles.gameContent} showsVerticalScrollIndicator={true}>
          {renderActiveGame()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GameModal;
