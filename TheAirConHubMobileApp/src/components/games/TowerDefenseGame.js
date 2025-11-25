import React, { useState, useEffect, useRef, useCallback } from "react";
// MODIFIED: Cleaned up imports
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
} from "react-native";
import {
  Wind,
  Bug,
  ShieldAlert,
  Target,
  Coins,
  Heart,
  Waves,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import Svg, { Polyline } from "react-native-svg";
import { styles as appStyles } from "../../styles/AppStyles";

//Import Game Configs
import { GAME_MAP, TOWER_CONFIG, ENEMY_CONFIG } from "./TowerDefenseConfig";

const { width } = Dimensions.get("window");
const GAME_AREA_HEIGHT = 350;
const GAME_AREA_WIDTH = 350; // Set to height to make it square
const TILE_SIZE = GAME_AREA_WIDTH / 10; // 10 tiles wide
const T_CENTER = TILE_SIZE / 2; // Helper for tile center

const path = [
  { x: T_CENTER * 2.55, y: GAME_AREA_HEIGHT - 40 }, // Start
  { x: T_CENTER * 2.55, y: T_CENTER * 17.2 }, // Waypoint 1: Fan
  { x: T_CENTER * 2.55, y: T_CENTER * 10 }, // Waypoint 2: Corner
  { x: T_CENTER * 3.7, y: T_CENTER * 8.5 }, // Waypoint 3: Corner
  { x: T_CENTER * 3.7, y: T_CENTER * 3.8 }, // Waypoint 4: Corner
  { x: T_CENTER * 16.2, y: T_CENTER * 3.8 }, // Waypoint 5: Corner
  { x: T_CENTER * 16.2, y: T_CENTER * 17.5 }, // Waypoint 6: Corner
  { x: T_CENTER * 6.25, y: T_CENTER * 17.5 }, // Waypoint 7: Corner
  { x: T_CENTER * 6.25, y: T_CENTER * 17.5 }, // Waypoint 8: Grate
  { x: T_CENTER * 6.25, y: GAME_AREA_HEIGHT - 43.75 }, // End
];

// region Tower PLacement Slots
const placementSlots = [
  // --- Top Row ---
  { id: "r0c0", x: T_CENTER * 1.25, y: T_CENTER * 1.25 },
  { id: "r0c2", x: T_CENTER * 3.75, y: T_CENTER * 1.25 },
  { id: "r0c4", x: T_CENTER * 6.1, y: T_CENTER * 1.25 },
  { id: "r0c6", x: T_CENTER * 8.5, y: T_CENTER * 1.25 },
  { id: "r0c8", x: T_CENTER * 11, y: T_CENTER * 1.25 },
  { id: "r0c10", x: T_CENTER * 13.5, y: T_CENTER * 1.25 },
  { id: "r0c12", x: T_CENTER * 16, y: T_CENTER * 1.25 },
  { id: "r0c14", x: T_CENTER * 18.5, y: T_CENTER * 1.25 },

  // --- Left Column ---
  { id: "r2c0", x: T_CENTER * 1.25, y: T_CENTER * 3.75 },
  { id: "r4c0", x: T_CENTER * 1.25, y: T_CENTER * 6.25 },

  // --- Inner Area (Upper) ---
  { id: "r2c3", x: T_CENTER * 6.75, y: T_CENTER * 6.75 },
  { id: "r2c5", x: T_CENTER * 11.4, y: T_CENTER * 6.75 },
  { id: "r2c7", x: T_CENTER * 13.5, y: T_CENTER * 6.75 },

  // --- Inner Area (Lower) ---
  { id: "r4c3", x: T_CENTER * 6.75, y: T_CENTER * 9 },

  // --- Bottom Area ---
  { id: "r6c2", x: T_CENTER * 5.5, y: T_CENTER * 14 },
  { id: "r6c4", x: T_CENTER * 8, y: T_CENTER * 14 },
  { id: "r6c6", x: T_CENTER * 10.5, y: T_CENTER * 14 },
  { id: "r6c8", x: T_CENTER * 13, y: T_CENTER * 14 },
  { id: "r6c10", x: T_CENTER * 5.5, y: T_CENTER * 11.5 },
  { id: "r6c12", x: T_CENTER * 8, y: T_CENTER * 11.5 },
  { id: "r6c14", x: T_CENTER * 10.5, y: T_CENTER * 11.5 },
  { id: "r6c16", x: T_CENTER * 13, y: T_CENTER * 11.5 },

  // --- Right Column ---
  { id: "r2c9", x: T_CENTER * 18.5, y: T_CENTER * 3.75 },
  { id: "r4c9", x: T_CENTER * 18.5, y: T_CENTER * 6.25 },
  { id: "r6c9", x: T_CENTER * 18.5, y: T_CENTER * 8.95 },
  { id: "r8c9", x: T_CENTER * 18.5, y: T_CENTER * 11.55 },
  { id: "r8c11", x: T_CENTER * 18.5, y: T_CENTER * 14.25 },
  { id: "r8c13", x: T_CENTER * 18.5, y: T_CENTER * 17.25 },
];

const MAX_WAVES = 5;
const GAME_TICK_MS = 60;
let entityId = 0;

const TOWER_KEYS = Object.keys(TOWER_CONFIG);
const MAX_TOWER_INDEX = TOWER_KEYS.length - 1;

const getDistance = (p1, p2) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

const TowerDefenseGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState("ready");
  const [health, setHealth] = useState(20);
  const [money, setMoney] = useState(150);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(0);

  const [towers, setTowers] = useState([]);
  const [selectedTowerIndex, setSelectedTowerIndex] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [spikes, setSpikes] = useState([]);

  const [placingTowerType, setPlacingTowerType] = useState(null);
  const [placementPos, setPlacementPos] = useState(null);
  const [waveInProgress, setWaveInProgress] = useState(false);

  const spawnQueueRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const gameAreaRef = useRef(null);

  const lastFrameTimeRef = useRef(Date.now());

  // region --- Game Logic
  const startGame = () => {
    setHealth(100);
    setMoney(300);
    setScore(0);
    setWave(0);
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setPlacingTowerType(null);
    setPlacementPos(null);
    setWaveInProgress(false);
    spawnQueueRef.current = [];
    spawnTimerRef.current = 0;
    setGameState("playing");
  };

  const handlePrevTower = () => {
    // Fix: This line was missing its closing parenthesis and curly brace
    setSelectedTowerIndex((prevIndex) =>
      prevIndex === 0 ? MAX_TOWER_INDEX : prevIndex - 1
    ); // <-- ADDED closing parenthesis and semicolon
  }; // <-- ADDED closing curly brace

  const handleNextTower = () => {
    setSelectedTowerIndex(
      (prevIndex) =>
        // ERROR HERE: Change '1s' to '1'
        prevIndex === MAX_TOWER_INDEX ? 0 : prevIndex + 1 // CORRECTED
    );
  };

  const resetGame = () => {
    startGame();
  };

  const finishGame = (finalScore) => {
    if (!isPracticeMode && finalScore > 0) {
      onEarnPoints(finalScore);
    }
    onEndGame();
  };

  const handleGameOver = (win) => {
    setWaveInProgress(false);
    if (win) {
      const bonus = health * 10;
      setScore((s) => s + bonus);
      setGameState("gamewin");
    } else {
      setGameState("gameover");
    }
  };

  const startWave = () => {
    if (waveInProgress || gameState !== "playing") return;

    setWaveInProgress(true);
    const newWave = wave + 1;
    setWave(newWave);

    const numEnemies = newWave * 5;
    const enemyHealth = ENEMY_CONFIG.virusenemy.health + newWave * 10;
    const newQueue = [];
    for (let i = 0; i < numEnemies; i++) {
      newQueue.push({ type: "virusenemy", health: enemyHealth });
    }
    spawnQueueRef.current = newQueue;
    spawnTimerRef.current = 1000;
  };

  // region --- gameLoop ---
  const gameLoop = useCallback(() => {
    // 1. Check game state
    if (gameState !== "playing") {
        // Reset timer if paused so we don't jump
        lastFrameTimeRef.current = Date.now();
        return;
    }

    // 2. Calculate Delta Time (dt) in seconds
    const now = Date.now();
    const dt = (now - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = now;

    // Safety cap: If lag spike > 0.1s, cap at 0.1s to prevent massive jumps
    if (dt > 0.1) return;

    let newProjectiles = [];
    let pendingSpikes = [];
    let newMoney = money;
    let newScore = score;
    let newHealth = health;
    let enemiesToSpawn = [];

    // 1. Update Towers
    const updatedTowers = towers.map((tower) => {
      let newCooldown = tower.fireCooldown - (dt * 1000);
      let target = enemies.find((e) => e.id === tower.targetId);

      if (!target || getDistance(tower, target) > tower.range) {
        target = null;
        let closestDist = tower.range;
        for (const enemy of enemies) {
          const dist = getDistance(tower, enemy);
          if (dist <= closestDist) {
            closestDist = dist;
            target = enemy;
          }
        }
      }

      if (target && newCooldown <= 0) {
        newCooldown = tower.fireRate;
        if (tower.projectileSprite && !tower.aoeDamage) {
          newProjectiles.push({
            id: `proj_${entityId++}`,
            x: tower.x,
            y: tower.y,
            damage: tower.damage,
            targetId: target.id,
            speed: 300,
            type: tower, // store full tower config
            aoeRadius: tower.aoeRadius,
            splashRadius: tower.splashRadius,
            sprite: tower.projectileSprite,
          });
        }
        return { ...tower, fireCooldown: newCooldown, targetId: target.id };
      }

      return { ...tower, fireCooldown: newCooldown, targetId: target?.id };
    });

    // 2. Update Projectiles
    let enemiesAfterHits = [...enemies];

    for (const tower of updatedTowers) {
      if (!tower.aoeDamage) continue;

      // Initialize cooldown on tower if undefined
      if (tower.aoeCooldown === undefined) {
        tower.aoeCooldown = tower.aoeTickRate;
      }

      tower.aoeCooldown -= (dt * 1000);

      // Only trigger damage when timer hits zero
      if (tower.aoeCooldown <= 0) {
        tower.aoeCooldown = tower.aoeTickRate;

        // FIND ALL ENEMIES INSIDE AOE
        const enemiesHit = enemiesAfterHits.filter((e) => {
          const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
          return dist <= tower.range;
        });

        // CREATE ONE SPIKE PER ENEMY
        const newSpikesArr = enemiesHit.map((e) => ({
          id: `spike_${entityId++}`,
          x: e.x,
          y: e.y + e.size / 2 - 15, // spike appears UNDER enemy feet
          sprite: tower.projectileSprite,
          duration: 300, // ms until spike disappears
        }));

        pendingSpikes.push(...newSpikesArr);

        // Apply AoE damage
        enemiesAfterHits = enemiesAfterHits.map((e) =>
          enemiesHit.includes(e)
            ? { ...e, health: e.health - tower.aoeDamage }
            : e
        );
      }
    }

    const updatedSpikes = spikes
      .map((s) => ({ ...s, duration: s.duration - (dt * 1000) }))
      .filter((s) => s.duration > 0);

    setSpikes([...updatedSpikes, ...pendingSpikes]);

    const remainingProjectiles = [];

    for (const p of projectiles) {
      const target = enemiesAfterHits.find((e) => e.id === p.targetId);
      if (!target) continue;

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < p.speed * dt) {
        // If full AoE tower (floor tower)
        if (p.splashRadius) {
          const target = enemiesAfterHits.find((e) => e.id === p.targetId);
          enemiesAfterHits = enemiesAfterHits.map((e) => {
            const d = Math.hypot(e.x - target.x, e.y - target.y);
            return d <= p.splashRadius
              ? { ...e, health: e.health - p.damage }
              : e;
          });
        }

        // Default single-target (wall mount)
        else {
          enemiesAfterHits = enemiesAfterHits.map((e) =>
            e.id === p.targetId ? { ...e, health: e.health - p.damage } : e
          );
        }
      } else {
        remainingProjectiles.push({
          ...p,
          x: p.x + (dx / dist) * p.speed * dt,
          y: p.y + (dy / dist) * p.speed * dt,
        });
      }
    }

    // 3. Update Enemies
    const remainingEnemies = [];
    for (const e of enemiesAfterHits) {
      if (e.health <= 0) {
        newMoney += e.money;
        newScore += 10;
        continue;
      }

      if (e.waypointIndex >= path.length) {
        newHealth -= 1;
        continue;
      }

      const target = path[e.waypointIndex];
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist < e.speed * dt) {
        remainingEnemies.push({
          ...e,
          x: target.x,
          y: target.y,
          waypointIndex: e.waypointIndex + 1,
        });
      } else {
        remainingEnemies.push({
          ...e,
          // OLD: x: e.x + (dx / dist) * e.speed,
          // NEW:
          x: e.x + (dx / dist) * e.speed * dt,
          y: e.y + (dy / dist) * e.speed * dt,
        });
      }
    }

    // 4. Spawn Enemies
    if (waveInProgress && spawnQueueRef.current.length > 0) {
      spawnTimerRef.current -= (dt * 1000);
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = 1000;
        const enemyData = spawnQueueRef.current.shift();
        enemiesToSpawn.push({
          id: `enemy_${entityId++}`,
          ...ENEMY_CONFIG[enemyData.type],
          x: path[0].x,
          y: path[0].y,
          health: enemyData.health,
          maxHealth: enemyData.health,
          waypointIndex: 1,
        });
      }
    }

    // 5. Apply Updates
    setTowers(updatedTowers);
    setEnemies([...remainingEnemies, ...enemiesToSpawn]);
    setProjectiles([...remainingProjectiles, ...newProjectiles]);
    setHealth(newHealth);
    setMoney(newMoney);
    setScore(newScore);

    if (newHealth <= 0) {
      handleGameOver(false);
      return;
    }

    if (
      waveInProgress &&
      remainingEnemies.length === 0 &&
      enemiesToSpawn.length === 0 &&
      spawnQueueRef.current.length === 0
    ) {
      setWaveInProgress(false);
      setMoney((m) => m + 100 + wave * 10);
      if (wave >= MAX_WAVES) {
        handleGameOver(true);
      }
    }
  }, [
    gameState,
    enemies,
    towers,
    projectiles,
    health,
    money,
    score,
    wave,
    waveInProgress,
  ]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const loop = setInterval(gameLoop, GAME_TICK_MS);
    return () => clearInterval(loop);
  }, [gameState, gameLoop]);

  // --- Click/Touch Handlers ---

  const handleSelectTower = (type) => {
    const config = TOWER_CONFIG[type];
    if (money >= config.cost) {
      setPlacingTowerType(type);
      setPlacementPos(null);
    } else {
      console.log("Not enough money!");
    }
  };

  // MODIFIED: Update placement pos now snaps to nearest valid slot
  const updatePlacementPos = (event) => {
    if (!gameAreaRef.current) return;
    const { pageX, pageY } = event.nativeEvent;

    gameAreaRef.current.measure((fx, fy, width, height, px, py) => {
      if (width === 0 && height === 0) return;

      const x = pageX - px;
      const y = pageY - py;

      // Find the closest valid slot
      let closestSlot = null;
      let minDistance = Infinity;

      // How close your finger needs to be to "snap" to a slot (e.g., 30 pixels)
      const SNAP_RADIUS = 30;

      placementSlots.forEach((slot) => {
        const dist = Math.hypot(x - slot.x, y - slot.y);
        if (dist < minDistance && dist < SNAP_RADIUS) {
          minDistance = dist;
          closestSlot = slot;
        }
      });

      if (closestSlot) {
        setPlacementPos({ x: closestSlot.x, y: closestSlot.y });
      } else {
        // If too far from any slot, don't show preview (or show at finger pos but indicate invalid)
        setPlacementPos(null);
      }
    });
  };

  // MODIFIED: Place tower logic
  const handlePlaceTower = () => {
    // Only place if we have a valid snapped position
    if (!placingTowerType || !placementPos) {
      if (placingTowerType) {
        // If user lifts finger without snapping to a slot, cancel placement
        setPlacingTowerType(null);
        setPlacementPos(null);
      }
      return;
    }

    // Check if a tower is already on this spot
    const isOccupied = towers.some(
      (t) =>
        Math.abs(t.x - placementPos.x) < 5 && Math.abs(t.y - placementPos.y) < 5
    );

    if (isOccupied) {
      console.log("Slot occupied!");
      return;
    }

    const config = TOWER_CONFIG[placingTowerType];

    setTowers((prev) => [
      ...prev,
      {
        id: `tower_${entityId++}`,
        ...config,
        x: placementPos.x,
        y: placementPos.y,
        fireCooldown: 0,
        targetId: null,
      },
    ]);
    setMoney((m) => m - config.cost);
    setPlacingTowerType(null);
    setPlacementPos(null);
  };

  // --- 3. Render Functions ---

  // RENDER: Ready Screen
  if (gameState === "ready") {
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameReadyContainer}>
          <ShieldAlert
            size={50}
            color="#3B82F6"
            style={appStyles.leakGameIcon}
          />
          <Text style={appStyles.gameTitle}>A/C Tower Defense</Text>
          <Text style={appStyles.gameSubtitle}>
            Defend your system from oncoming viruses!
          </Text>
          <View style={appStyles.leakGameHowTo}>
            <Text style={appStyles.leakGameHowToTitle}>How to Play:</Text>
            <Text style={appStyles.leakGameHowToText}>
              • Buy A/C Towers to place on the map.
            </Text>
            <Text style={appStyles.leakGameHowToText}>
              • Drag towers to the valid slots (marked spots).
            </Text>
            <Text style={appStyles.leakGameHowToText}>
              • Stop viruses from reaching the end!
            </Text>
            <Text style={appStyles.leakGameHowToText}>
              • Survive {MAX_WAVES} waves to win.
            </Text>
          </View>
          <TouchableOpacity
            onPress={startGame}
            style={appStyles.leakGameStartButton}
          >
            <Text style={appStyles.leakGameStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Defense"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // RENDER: Game Over / Win Screen
  if (gameState === "gameover" || gameState === "gamewin") {
    const isWin = gameState === "gamewin";
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameOverContainer}>
          {isWin ? (
            <CheckCircle
              size={50}
              color="#10B981"
              style={appStyles.leakGameIcon}
            />
          ) : (
            <XCircle size={50} color="#EF4444" style={appStyles.leakGameIcon} />
          )}
          <Text style={appStyles.gameTitle}>
            {isWin ? "System Secured!" : "Game Over"}
          </Text>
          <Text style={appStyles.leakGameFinalScore}>{score}</Text>
          <Text style={appStyles.gameSubtitle}>Final Score</Text>
          <TouchableOpacity
            onPress={resetGame}
            style={appStyles.leakGameStartButton}
          >
            <Text style={appStyles.leakGameStartButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[appStyles.backToHubButton, { marginTop: 10 }]}
            onPress={() => finishGame(score)}
          >
            <Text style={appStyles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // RENDER: Main "Playing" Screen
  return (
    <View style={appStyles.gameCard}>
      {/* Stats Header */}
      <View style={appStyles.leakGameHeader}>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Health</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: "#28a745" }]}>
            <Heart size={16} color="#28a745" /> {health}
          </Text>
        </View>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Money</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: "#ffc107" }]}>
            <Coins size={16} color="#ffc107" /> {money}
          </Text>
        </View>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Wave</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: "#17a2b8" }]}>
            <Waves size={16} color="#17a2b8" /> {wave}/{MAX_WAVES}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View
        ref={gameAreaRef}
        style={localStyles.gameArea}
        onStartShouldSetResponder={() => true}
        onResponderGrant={updatePlacementPos}
        onResponderMove={updatePlacementPos}
        onResponderRelease={handlePlaceTower}
      >
        {/* Child 1: Background */}
        <Image
          source={GAME_MAP}
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
          resizeMode="stretch"
        />

        {/* Child 2: Placement Slot Indicators (Optional: Shows where you can build) */}
        {/* Only show these when dragging a tower to guide the player */}
        {placingTowerType &&
          placementSlots.map((slot) => (
            <View
              key={slot.id}
              style={[
                localStyles.placementSlot,
                { left: slot.x - 10, top: slot.y - 10 }, // Center the 20x20 dot
              ]}
            />
          ))}

        {/* Child 3: Towers */}
        {towers.map((tower) => (
          <View
            key={tower.id}
            style={[
              localStyles.tower,
              {
                left: tower.x - tower.size / 2,
                top: tower.y - tower.size / 2,
                width: tower.size,
                height: tower.size,
              },
            ]}
          >
            <Image source={tower.sprite} style={localStyles.spriteImage} />
          </View>
        ))}

        {/* Child 4: Enemies */}
        {enemies.map((enemy) => (
          <View
            key={enemy.id}
            style={[
              localStyles.enemy,
              {
                left: enemy.x - enemy.size / 2,
                top: enemy.y - enemy.size / 2,
                width: enemy.size,
                height: enemy.size,
              },
            ]}
          >
            <Image source={enemy.sprite} style={localStyles.spriteImage} />
            <View style={localStyles.healthBarOuter}>
              <View
                style={[
                  localStyles.healthBarInner,
                  { width: `${(enemy.health / enemy.maxHealth) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))}

        {/* Child 5: Projectiles */}
        {projectiles.map((p) => (
          <Image
            key={p.id}
            source={p.sprite}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              left: p.x - 10,
              top: p.y - 10,
              resizeMode: "contain",
            }}
          />
        ))}

        {/* Child 6: Floor Tower Spike Effects */}
        {spikes.map((s) => (
          <Image
            key={s.id}
            source={s.sprite}
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              left: s.x - 20,
              top: s.y - 20,
              resizeMode: "contain",
            }}
          />
        ))}

        {/* Child 7: Tower Placement Preview */}
        {placingTowerType && placementPos && (
          <View
            style={[
              localStyles.towerPreview,
              {
                width: TOWER_CONFIG[placingTowerType].range * 2,
                height: TOWER_CONFIG[placingTowerType].range * 2,
                left: placementPos.x - TOWER_CONFIG[placingTowerType].range,
                top: placementPos.y - TOWER_CONFIG[placingTowerType].range,
              },
            ]}
          >
            <View
              style={[
                localStyles.towerPreviewIcon,
                {
                  width: TOWER_CONFIG[placingTowerType].size,
                  height: TOWER_CONFIG[placingTowerType].size,
                },
              ]}
            >
              {TOWER_CONFIG[placingTowerType].icon("rgba(255,255,255,0.7)")}
            </View>
          </View>
        )}
      </View>

      {/* UI Controls */}
      <View style={localStyles.controlsContainer}>
        {/* New container for all tower options */}
        <View
          style={[
            localStyles.singleTowerSelectionContainer,
            { flex: 2, marginRight: 10 },
          ]}
        >
          <TouchableOpacity
            style={localStyles.arrowButton}
            onPress={handlePrevTower}
          >
            <ChevronLeft size={28} color="#3B82F6" />
          </TouchableOpacity>

          {/* Current Tower Option */}
          {TOWER_KEYS.length > 0 &&
            (() => {
              const currentTowerKey = TOWER_KEYS[selectedTowerIndex];
              const config = TOWER_CONFIG[currentTowerKey];

              return (
                <TouchableOpacity
                  key={currentTowerKey}
                  style={[
                    localStyles.controlButton,
                    // Takes up the available space between arrows
                    { flex: 1, marginHorizontal: 5 },
                  ]}
                  onPress={() => handleSelectTower(currentTowerKey)}
                >
                  {/* Dynamically render the icon and text */}
                  {config.icon("#3B82F6")}
                  <Text style={localStyles.controlButtonText} numberOfLines={1}>
                    {/* Format the key for display (e.g., 'casettetower' -> 'Cassette') */}
                    {currentTowerKey
                      .replace("tower", "")
                      .replace("mounted", " Mounted")
                      .trim()}{" "}
                    (${config.cost})
                  </Text>
                  {placingTowerType === currentTowerKey && (
                    <View style={localStyles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              );
            })()}

          {/* Right Arrow Button */}
          <TouchableOpacity
            style={localStyles.arrowButton}
            onPress={handleNextTower}
          >
            <ChevronRight size={28} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Start Wave Button (flex: 1) */}
        <TouchableOpacity
          style={[appStyles.startButton, { flex: 1 }]}
          onPress={startWave}
          disabled={waveInProgress}
        >
          <Text style={appStyles.startButtonText}>
            {waveInProgress
              ? `Wave ${wave} in Progress...`
              : `Start Wave ${wave + 1}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

//region --- 4. Local Styles ---

const localStyles = StyleSheet.create({
  gameArea: {
    height: GAME_AREA_HEIGHT,
    width: GAME_AREA_WIDTH,
    backgroundColor: "black",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#374151",
    alignSelf: "center",
  },
  // NEW: Style for valid placement slots
  placementSlot: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.5)", // Semi-transparent blue
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.8)",
    zIndex: 5, // Ensure it's above background but below towers
  },
  tower: {
    position: "absolute",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  enemy: {
    position: "absolute",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  spriteImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  healthBarOuter: {
    position: "absolute",
    top: -6,
    height: 4,
    width: "100%",
    backgroundColor: "#4B5563",
    borderRadius: 2,
  },
  healthBarInner: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  projectile: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0E94F9",
  },
  towerPreview: {
    position: "absolute",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.8)",
    borderWidth: 1,
    borderRadius: 1000, // Large number for circle
    alignItems: "center",
    justifyContent: "center",
  },
  towerPreviewIcon: {
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  singleTowerSelectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    backgroundColor: "#F3F4F6", // Light background to frame the selection
    borderRadius: 8,
  },
  arrowButton: {
    padding: 5,
  },
  controlButton: {
    // Reset button styles for the new layout
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    // REMOVE fixed width: 'width: 100,'
  },
  controlButtonText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
  selectedIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
});

export default TowerDefenseGame;
