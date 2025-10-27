import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet, // Import StyleSheet
} from "react-native";
import { CloudOff, CheckCircle } from "lucide-react-native";
// Re-import AppStyles for shared styles like gameCard, gameTitle, etc.
import { styles as appStyles } from "../../styles/AppStyles";

// Helper to check if device is mobile based on width (adjust breakpoint as needed)
const { width } = Dimensions.get("window");
const isMobile = width < 768;


const BlockTheHazeGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [blockerPosition, setBlockerPosition] = useState(40); // percentage from left
  const [hazeDrops, setHazeDrops] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [spawnInterval, setSpawnInterval] = useState(1500); // Slower spawning
  const gameAreaRef = useRef(null);
  const [gameAreaWidth, setGameAreaWidth] = useState(300); // Default width
  const blockerPositionRef = useRef(40); // Ref to track blocker position for collision

  // Constants specific to this game
  const BLOCKER_WIDTH = 25; // Blocker width as percentage
  const DROP_SIZE_PERCENT = 8; // Drop size as percentage width
  const SAFE_ZONE_MARGIN = 10; // Margin from edges where drops won't spawn

  // Update ref whenever blockerPosition changes
  useEffect(() => {
    blockerPositionRef.current = blockerPosition;
  }, [blockerPosition]);

  // Measure game area width on layout
  const onGameAreaLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setGameAreaWidth(width);
  };

  // Generate random haze drop within the safe zone
  const generateHazeDrop = useCallback(() => {
    const minPos = SAFE_ZONE_MARGIN;
    const maxPos = 100 - DROP_SIZE_PERCENT - SAFE_ZONE_MARGIN;
    const position = minPos + Math.random() * (maxPos - minPos);

    const newDrop = {
      id: Date.now() + Math.random(), // Unique ID
      position: position, // % from left
      top: -10, // Start above the screen (%)
      blocked: false,
      missed: false,
    };
    return newDrop;
  }, [DROP_SIZE_PERCENT, SAFE_ZONE_MARGIN]); // Dependencies for useCallback

  // Start game function
  const startGame = () => {
    setScore(0);
    setLives(3);
    const startPos = 50 - BLOCKER_WIDTH / 2; // Center the blocker initially
    setBlockerPosition(startPos);
    blockerPositionRef.current = startPos;
    setHazeDrops([]);
    setGameActive(true);
    setGameState("playing");
    setSpawnInterval(1500); // Reset spawn speed
  };

  // Spawn drops at intervals effect
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setHazeDrops((prev) => [...prev, generateHazeDrop()]);
    }, spawnInterval);

    return () => clearInterval(interval); // Cleanup on unmount or game end
  }, [gameActive, generateHazeDrop, spawnInterval]);

  // Move drops down and check collisions effect
  useEffect(() => {
    if (!gameActive) return;

    const moveInterval = setInterval(() => {
      setHazeDrops((prev) => {
        const updated = [];
        let scoreChange = 0;
        let livesLost = 0;
        const currentBlockerPos = blockerPositionRef.current; // Read ref inside interval

        prev.forEach((drop) => {
          if (drop.blocked || drop.missed) {
             if (drop.top < 110) { // Keep until off screen
                 updated.push({ ...drop, top: drop.top + 3 }); // Continue falling slowly
             }
             return; // Don't process collision again
          }

          const newTop = drop.top + 2; // Adjust fall speed here

          // Collision check zone (when drop is near the bottom)
          if (newTop >= 85 && newTop <= 92) { // Check slightly before ground
            const dropCenter = drop.position + DROP_SIZE_PERCENT / 2;
            const blockerLeft = currentBlockerPos;
            const blockerRight = currentBlockerPos + BLOCKER_WIDTH;

            if (dropCenter >= blockerLeft && dropCenter <= blockerRight) {
              // Blocked!
              scoreChange += 10;
              updated.push({ ...drop, top: newTop, blocked: true });
            } else {
                 if (newTop >= 90) { // Check if passed the blocker level
                     livesLost += 1;
                     updated.push({ ...drop, top: newTop, missed: true });
                 } else {
                    updated.push({ ...drop, top: newTop }); // Still falling towards blocker
                 }
            }
          } else if (newTop < 100) { // Keep drops that haven't reached bottom
            updated.push({ ...drop, top: newTop });
          }
          // Drops reaching top > 100 are naturally filtered out later
        });

        // Update score and potentially difficulty
        if (scoreChange > 0) {
          setScore((s) => {
            const newScore = s + scoreChange;
            if (newScore > 0 && newScore % 50 === 0) {
              setSpawnInterval((prevInterval) => Math.max(500, prevInterval - 100)); // Cap minimum interval
            }
            return newScore;
          });
        }

        // Update lives and check for game over
        if (livesLost > 0) {
          setLives((l) => {
            const newLives = l - livesLost;
            if (newLives <= 0) {
              setGameActive(false);
              setGameState("gameover");
              return 0;
            }
            return newLives;
          });
        }

        // Return the array of updated/kept drops
        return updated.filter(drop => drop.top <= 110); // Filter out drops fully off screen

      }); // End setHazeDrops
    }, 50); // Drop movement update frequency (ms)

    return () => clearInterval(moveInterval); // Cleanup interval
  }, [gameActive]); // Dependency: only run when gameActive changes


  // Handle touch/mouse drag on the game area
  const handlePanResponderMove = (event) => {
    if (!gameActive || !gameAreaRef.current || !gameAreaWidth || gameAreaWidth <= 0) return;

    const locationX = event.nativeEvent.pageX ?? event.nativeEvent.locationX;
     if (locationX === undefined || locationX === null) return;

     gameAreaRef.current.measure((fx, fy, width, height, px, py) => {
        if (!width) return;
         const relativeX = locationX - px;
        const newPositionPercent = (relativeX / width) * 100;
        // Clamp position ensuring the blocker stays fully within bounds
        const clampedPosition = Math.max(
          0,
          Math.min(100 - BLOCKER_WIDTH, newPositionPercent - BLOCKER_WIDTH / 2) // Center blocker on touch
        );

         if (Math.abs(clampedPosition - blockerPositionRef.current) > 0.5) { // Threshold to prevent jitter
             setBlockerPosition(clampedPosition);
         }
     });
  };

  // Handle continuous movement for buttons
  const buttonPressInterval = useRef(null);
  const moveBlocker = (direction) => {
    setBlockerPosition((prev) => {
      let newPos;
      const moveAmount = 8; // Faster movement speed
      if (direction === "left") {
        newPos = Math.max(0, prev - moveAmount);
      } else {
        newPos = Math.min(100 - BLOCKER_WIDTH, prev + moveAmount);
      }
      return newPos;
    });
  };

  const startMoving = (direction) => {
    if (!gameActive) return;
    moveBlocker(direction);
    if (buttonPressInterval.current) clearInterval(buttonPressInterval.current);
    buttonPressInterval.current = setInterval(() => {
      moveBlocker(direction);
    }, 50); // Movement frequency (ms)
  };

  const stopMoving = () => {
    if (buttonPressInterval.current) {
      clearInterval(buttonPressInterval.current);
      buttonPressInterval.current = null;
    }
  };


  // Function to call when resetting the game (e.g., "Play Again")
  const resetGame = () => {
    stopMoving();
    startGame();
  };

  // Function to call when fully exiting the game (e.g., "Back to Games")
  const finishGame = () => {
    setGameActive(false);
    stopMoving();
    if (!isPracticeMode && score > 0) {
      onEarnPoints(score);
    }
    onEndGame();
  };

  // --- RENDER LOGIC ---

  // Ready Screen
  if (gameState === "ready") {
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameReadyContainer}> {/* Using shared style */}
          <CloudOff size={50} color="#3B82F6" style={appStyles.leakGameIcon} /> {/* Using shared style */}
          <Text style={appStyles.gameTitle}>Block the Haze</Text>
          <Text style={appStyles.gameSubtitle}>
            Stop the toxic haze drops from reaching the ground!
          </Text>
          <View style={appStyles.leakGameHowTo}> {/* Using shared style */}
            <Text style={appStyles.leakGameHowToTitle}>How to Play:</Text>
            <Text style={appStyles.leakGameHowToText}>
              • Press & hold arrow buttons to move
            </Text>
            <Text style={appStyles.leakGameHowToText}>• Or drag the barrier directly</Text>
            <Text style={appStyles.leakGameHowToText}>• Block falling drops (+10 pts)</Text>
            <Text style={appStyles.leakGameHowToText}>• You have 3 lives - don't miss!</Text>
          </View>
          <TouchableOpacity
            onPress={startGame}
            style={appStyles.leakGameStartButton} // Using shared style
          >
            <Text style={appStyles.leakGameStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Game"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Game Over Screen
  if (gameState === "gameover") {
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameOverContainer}> {/* Using shared style */}
          <CheckCircle size={50} color="#EF4444" style={appStyles.leakGameIcon} />
          <Text style={appStyles.gameTitle}>Game Over!</Text>
          <Text style={appStyles.leakGameFinalScore}>{score}</Text> {/* Using shared style */}
          <Text style={appStyles.gameSubtitle}>
            {isPracticeMode ? "Practice Complete" : `Final Score: ${score}`}
          </Text>
          <TouchableOpacity onPress={resetGame} style={appStyles.leakGameStartButton}> {/* Using shared style */}
            <Text style={appStyles.leakGameStartButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[appStyles.backToHubButton, { marginTop: 10 }]} // Using shared style
            onPress={finishGame}
          >
            <Text style={appStyles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active Game Screen (gameState === 'playing')
  return (
    <View style={appStyles.gameCard}>
      <Text style={appStyles.gameTitle}>Block the Haze</Text>

      {/* Score and Lives Header - Using shared leak game header styles */}
      <View style={[appStyles.leakGameHeader, { marginBottom: 10 }]}>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Score</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: "#10B981" }]}>
            {score}
          </Text>
        </View>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Lives</Text>
          <Text
            style={[
              appStyles.leakGameHeaderValue,
              { color: lives <= 1 ? "#EF4444" : "#FBBF24" },
            ]}
          >
            {"❤️".repeat(lives)}
          </Text>
        </View>
      </View>

      {/* Game Area - Uses localStyles */}
      <View
        ref={gameAreaRef}
        style={localStyles.hazeGameArea} // Use local style
        onLayout={onGameAreaLayout}
        onTouchStart={handlePanResponderMove}
        onTouchMove={handlePanResponderMove}
      >
        {/* Falling Haze Drops - Uses localStyles */}
        {hazeDrops.map((drop) => (
          <View
            key={drop.id}
            style={[
              localStyles.hazeDrop, // Use local style
              {
                left: `${drop.position}%`,
                top: `${drop.top}%`,
                opacity: drop.blocked || drop.missed ? 0.4 : 1,
                backgroundColor: drop.blocked
                  ? "#10B981" // Green
                  : drop.missed
                  ? "#EF4444" // Red
                  : "#78716C", // Default color
                width: `${DROP_SIZE_PERCENT}%`,
                // borderRadius: 50, // Moved to localStyles
              },
            ]}
          >
             <CloudOff size={isMobile ? 10 : 12} color="white" />
          </View>
        ))}

        {/* Blocker Bar - Uses localStyles */}
        <View
          style={[
            localStyles.hazeBlocker, // Use local style
            {
              left: `${blockerPosition}%`,
              width: `${BLOCKER_WIDTH}%`,
            },
          ]}
        />

        {/* Ground Line - Uses localStyles */}
        <View style={localStyles.hazeGroundLine} />
      </View>

      {/* Control Buttons - Uses localStyles */}
      <View style={localStyles.hazeControlsContainer}>
        <TouchableOpacity
          style={localStyles.hazeControlButton} // Use local style
          onPressIn={() => startMoving("left")}
          onPressOut={stopMoving}
          disabled={!gameActive}
        >
          <Text style={localStyles.hazeControlButtonText}>⬅️ LEFT</Text> {/* Use local style */}
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.hazeControlButton} // Use local style
          onPressIn={() => startMoving("right")}
          onPressOut={stopMoving}
          disabled={!gameActive}
        >
          <Text style={localStyles.hazeControlButtonText}>RIGHT ➡️</Text> {/* Use local style */}
        </TouchableOpacity>
      </View>

      {/* Subtitle - Uses shared style */}
      <Text style={[appStyles.gameSubtitle, { fontSize: 11, marginTop: 5 }]}>
        Hold buttons or drag the barrier
      </Text>
    </View>
  );
};

// Create local StyleSheet for BlockTheHazeGame specific styles
const localStyles = StyleSheet.create({
  hazeGameArea: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    height: 350, // Adjust height as needed
    width: "100%",
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#374151",
  },
  hazeDrop: {
    position: "absolute",
    // width is percentage based, defined inline
    aspectRatio: 1, // Make it square based on width
    borderRadius: 50, // Large value ensures circle shape
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  hazeBlocker: {
    position: "absolute",
    bottom: 35, // Position above the ground line
    height: 12,
    backgroundColor: "#3B82F6", // Blocker color
    borderRadius: 6,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8, // For Android shadow
  },
  hazeGroundLine: {
    position: "absolute",
    bottom: 0, // At the very bottom
    left: 0,
    right: 0,
    height: 4, // Thickness of the ground line
    backgroundColor: "#EF4444", // Color for the ground line (e.g., red)
  },
  hazeControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10, // Space between buttons
    marginTop: 10, // Space above buttons
  },
  hazeControlButton: {
    flex: 1, // Make buttons share width equally
    backgroundColor: "#3B82F6", // Button color
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center", // Center text horizontally
  },
  hazeControlButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default BlockTheHazeGame; // Export the component

