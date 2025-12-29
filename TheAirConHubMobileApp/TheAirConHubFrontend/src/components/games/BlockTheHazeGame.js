import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  Animated, // Added for the fade effect
} from "react-native";
import { CloudOff, CheckCircle } from "lucide-react-native";
import { styles as appStyles } from "../../styles/AppStyles";

// Assets
import haze from "../../../assets/blockthehaze/haze.png";
import haze2 from "../../../assets/blockthehaze/haze2.png";
import hazedestroy from "../../../assets/blockthehaze/hazedestroy.gif";
import haze2destroy from "../../../assets/blockthehaze/haze2destroy.gif";
import platformImg from "../../../assets/blockthehaze/platform.png";

const { width } = Dimensions.get("window");

//region destroying haze component
const DestroyingHaze = ({ drop, dropSize }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800, // Adjust this to match your GIF duration
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        localStyles.hazeDrop,
        {
          left: `${drop.position}%`,
          top: `${drop.top}%`,
          width: `${dropSize}%`,
          opacity: fadeAnim, // Binds opacity to the animation
        },
      ]}
    >
      <Image
        source={drop.type === 1 ? hazedestroy : haze2destroy}
        style={{ width: '180%', height: '180%' }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

//region Main Game Component
const BlockTheHazeGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [spawnInterval, setSpawnInterval] = useState(1500);
  const [blockerPosition, setBlockerPosition] = useState(40);
  const [hazeDrops, setHazeDrops] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const gameAreaRef = useRef(null);
  const [gameAreaWidth, setGameAreaWidth] = useState(300);
  const blockerPositionRef = useRef(40);

  const BLOCKER_WIDTH = 25;
  const DROP_SIZE_PERCENT = 10;
  const SAFE_ZONE_MARGIN = 10;

  const startGame = () => {
    setScore(0);
    setLives(3);
    const startPos = 50 - BLOCKER_WIDTH / 2;
    setBlockerPosition(startPos);
    blockerPositionRef.current = startPos;
    setHazeDrops([]);
    setGameActive(true);
    setGameState("playing");
    setSpawnInterval(1500);
  };

  const onGameAreaLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setGameAreaWidth(width);
  };

  useEffect(() => {
    blockerPositionRef.current = blockerPosition;
  }, [blockerPosition]);

  const generateHazeDrop = useCallback(() => {
    const minPos = SAFE_ZONE_MARGIN;
    const maxPos = 100 - DROP_SIZE_PERCENT - SAFE_ZONE_MARGIN;
    const position = minPos + Math.random() * (maxPos - minPos);
    const type = Math.random() > 0.5 ? 1 : 2;

    return {
      id: Date.now() + Math.random(),
      position: position,
      top: -10,
      type: type,
      blocked: false,
      missed: false,
    };
  }, []);

  useEffect(() => {
    if (!gameActive) return;
    const interval = setInterval(() => {
      setHazeDrops((prev) => [...prev, generateHazeDrop()]);
    }, spawnInterval);
    return () => clearInterval(interval);
  }, [gameActive, generateHazeDrop, spawnInterval]);

  useEffect(() => {
    if (!gameActive) return;

    const moveInterval = setInterval(() => {
      setHazeDrops((prev) => {
        const updated = [];
        let scoreChange = 0;
        let livesLost = 0;
        const currentBlockerPos = blockerPositionRef.current;

        prev.forEach((drop) => {
          // If already blocked, just keep it in the list (DestroyingHaze component handles the rest)
          if (drop.blocked) {
            updated.push(drop);
            return;
          }

          if (drop.missed) {
             updated.push({ ...drop, top: drop.top + 2 });
             return;
          }

          const newTop = drop.top + 2;

          // Collision detection
          if (newTop >= 80 && newTop <= 86) {
            const dropCenter = drop.position + DROP_SIZE_PERCENT / 2;
            const blockerLeft = currentBlockerPos;
            const blockerRight = currentBlockerPos + BLOCKER_WIDTH;

            if (dropCenter >= blockerLeft && dropCenter <= blockerRight) {
              scoreChange += 10;
              // Mark as blocked - it will now stop moving in this loop
              updated.push({ ...drop, top: newTop, blocked: true });
              return;
            }
          }

          if (newTop >= 92) {
            livesLost += 1;
            updated.push({ ...drop, top: newTop, missed: true });
          } else {
            updated.push({ ...drop, top: newTop });
          }
        });

        if (scoreChange > 0) {
          setScore((s) => {
            const newScore = s + scoreChange;
            if (newScore > 0 && newScore % 50 === 0) {
              setSpawnInterval((prev) => Math.max(500, prev - 100));
            }
            return newScore;
          });
        }

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

        return updated.filter((drop) => drop.top <= 110);
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameActive]);

  const handlePanResponderMove = (event) => {
    if (!gameActive || !gameAreaRef.current || !gameAreaWidth) return;
    const locationX = event.nativeEvent.pageX ?? event.nativeEvent.locationX;
    gameAreaRef.current.measure((fx, fy, width, height, px, py) => {
      const relativeX = locationX - px;
      const newPositionPercent = (relativeX / width) * 100;
      const clampedPosition = Math.max(0, Math.min(100 - BLOCKER_WIDTH, newPositionPercent - BLOCKER_WIDTH / 2));
      setBlockerPosition(clampedPosition);
    });
  };

  const buttonPressInterval = useRef(null);
  const moveBlocker = (direction) => {
    setBlockerPosition((prev) => (direction === "left" ? Math.max(0, prev - 8) : Math.min(100 - BLOCKER_WIDTH, prev + 8)));
  };

  const startMoving = (direction) => {
    if (!gameActive) return;
    moveBlocker(direction);
    buttonPressInterval.current = setInterval(() => moveBlocker(direction), 50);
  };

  const stopMoving = () => {
    if (buttonPressInterval.current) clearInterval(buttonPressInterval.current);
  };

  const finishGame = () => {
    setGameActive(false);
    if (!isPracticeMode && score > 0) onEarnPoints(score);
    onEndGame();
  };

  //region Render States
  if (gameState === "ready") {
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameReadyContainer}>
          {" "}
          {/* Using shared style */}
          <CloudOff
            size={50}
            color="#3B82F6"
            style={appStyles.leakGameIcon}
          />{" "}
          {/* Using shared style */}
          <Text style={appStyles.gameTitle}>Block the Haze</Text>
          <Text style={appStyles.gameSubtitle}>
            Stop the toxic haze drops from reaching the ground!
          </Text>
          <View style={appStyles.leakGameHowTo}>
            {" "}
            {/* Using shared style */}
            <Text style={appStyles.leakGameHowToTitle}>How to Play:</Text>
            <Text style={appStyles.leakGameHowToText}>
              • Press & hold arrow buttons to move
            </Text>
            <Text style={appStyles.leakGameHowToText}>
              • Or drag the barrier directly
            </Text>
            <Text style={appStyles.leakGameHowToText}>
              • Block falling drops (+10 pts)
            </Text>
            <Text style={appStyles.leakGameHowToText}>
              • You have 3 lives - don't miss!
            </Text>
          </View>
          <TouchableOpacity
            onPress={startGame}
            style={appStyles.leakGameStartButton} // Using shared style
          >
            <Text style={appStyles.leakGameStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Blocking"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === "gameover") {
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameOverContainer}>
          <CheckCircle size={50} color="#EF4444" style={appStyles.leakGameIcon} />
          <Text style={appStyles.gameTitle}>Game Over!</Text>
          <Text style={appStyles.leakGameFinalScore}>{score}</Text>
          <TouchableOpacity onPress={startGame} style={appStyles.leakGameStartButton}>
            <Text style={appStyles.leakGameStartButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[appStyles.backToHubButton, { marginTop: 10 }]} onPress={finishGame}>
            <Text style={appStyles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={appStyles.gameCard}>
      <Text style={appStyles.gameTitle}>Block the Haze</Text>
      <View style={[appStyles.leakGameHeader, { marginBottom: 10 }]}>
        <View style={appStyles.leakGameHeaderItem}><Text style={appStyles.leakGameHeaderLabel}>Score</Text><Text style={[appStyles.leakGameHeaderValue, { color: "#10B981" }]}>{score}</Text></View>
        <View style={appStyles.leakGameHeaderItem}><Text style={appStyles.leakGameHeaderLabel}>Lives</Text><Text style={appStyles.leakGameHeaderValue}>{"❤️".repeat(lives)}</Text></View>
      </View>

      <View ref={gameAreaRef} style={localStyles.hazeGameArea} onLayout={onGameAreaLayout} onTouchStart={handlePanResponderMove} onTouchMove={handlePanResponderMove}>
        {hazeDrops.map((drop) => (
          drop.blocked ? (
            <DestroyingHaze key={drop.id} drop={drop} dropSize={DROP_SIZE_PERCENT} />
          ) : (
            <View
              key={drop.id}
              style={[localStyles.hazeDrop, { left: `${drop.position}%`, top: `${drop.top}%`, width: `${DROP_SIZE_PERCENT}%` }]}
            >
              <Image 
                source={drop.type === 1 ? haze : haze2} 
                style={{ width: '100%', height: '100%', opacity: drop.missed ? 0.3 : 1 }}
                resizeMode="contain"
              />
            </View>
          )
        ))}

        <View style={[localStyles.hazeBlocker, { left: `${blockerPosition}%`, width: `${BLOCKER_WIDTH}%` }]}>
          <Image source={platformImg} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
        </View>
        <View style={localStyles.hazeGroundLine} />
      </View>

      <View style={localStyles.hazeControlsContainer}>
        <TouchableOpacity style={localStyles.hazeControlButton} onPressIn={() => startMoving("left")} onPressOut={stopMoving}><Text style={localStyles.hazeControlButtonText}>⬅️ LEFT</Text></TouchableOpacity>
        <TouchableOpacity style={localStyles.hazeControlButton} onPressIn={() => startMoving("right")} onPressOut={stopMoving}><Text style={localStyles.hazeControlButtonText}>RIGHT ➡️</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  hazeGameArea: { backgroundColor: "#1F2937", borderRadius: 12, height: 350, width: "100%", position: "relative", overflow: "hidden", marginBottom: 10, borderWidth: 2, borderColor: "#374151" },
  hazeDrop: { position: "absolute", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  hazeBlocker: { position: "absolute", bottom: 30, height: 25 },
  hazeGroundLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: "#EF4444" },
  hazeControlsContainer: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
  hazeControlButton: { flex: 1, backgroundColor: "#3B82F6", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  hazeControlButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },
});

export default BlockTheHazeGame;