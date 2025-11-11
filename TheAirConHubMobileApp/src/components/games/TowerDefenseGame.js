import React, { useState, useEffect, useRef, useCallback } from 'react';
// MODIFIED: Removed TouchableOpacity from here, View is sufficient
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Wind, Bug, ShieldAlert, Target, Coins, Heart, Waves, CheckCircle, XCircle } from 'lucide-react-native';
import { styles as appStyles } from '../../styles/AppStyles';

// ... (GAME_CONFIG, path, TOWER_CONFIG, etc. are unchanged) ...
const { width } = Dimensions.get('window');
const GAME_AREA_HEIGHT = 350;
const GAME_AREA_WIDTH = width * 0.9; // Match game card width
const TILE_SIZE = 40; // Size of grid squares for placement

const path = [
  { x: 0, y: TILE_SIZE * 2 },
  { x: TILE_SIZE * 3, y: TILE_SIZE * 2 },
  { x: TILE_SIZE * 3, y: TILE_SIZE * 5 },
  { x: TILE_SIZE * 6, y: TILE_SIZE * 5 },
  { x: TILE_SIZE * 6, y: TILE_SIZE * 1 },
  { x: GAME_AREA_WIDTH, y: TILE_SIZE * 1 },
];

const TOWER_CONFIG = {
  acTower: {
    cost: 100,
    range: 100, // pixels
    damage: 50,
    fireRate: 1000, // ms
    size: 30,
    icon: (color) => <Wind size={24} color={color} />,
  },
};

const ENEMY_CONFIG = {
  virus: {
    health: 50,
    speed: 1, // pixels per game tick
    money: 5,
    size: 20,
    icon: (color) => <Bug size={18} color={color} />,
  },
};

const MAX_WAVES = 5;
const GAME_TICK_MS = 50; 
let entityId = 0; 

const getDistance = (p1, p2) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};


const TowerDefenseGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState('ready');
  const [health, setHealth] = useState(20);
  const [money, setMoney] = useState(150);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(0);
  
  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  
  const [placingTowerType, setPlacingTowerType] = useState(null);
  const [placementPos, setPlacementPos] = useState(null); // NEW: Tracks finger/mouse
  const [waveInProgress, setWaveInProgress] = useState(false);
  
  const spawnQueueRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const gameAreaRef = useRef(null); // NEW: Ref for the game area

  // ... (startGame, resetGame, finishGame, handleGameOver are unchanged) ...
  const startGame = () => {
    setHealth(100);
    setMoney(300);
    setScore(0);
    setWave(0);
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setPlacingTowerType(null);
    setPlacementPos(null); // NEW
    setWaveInProgress(false);
    spawnQueueRef.current = [];
    spawnTimerRef.current = 0;
    setGameState('playing');
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
      setScore(s => s + bonus);
      setGameState('gamewin');
    } else {
      setGameState('gameover');
    }
  };

  // ... (startWave and gameLoop are unchanged) ...
  const startWave = () => {
    if (waveInProgress || gameState !== 'playing') return;
    
    setWaveInProgress(true);
    const newWave = wave + 1;
    setWave(newWave);
    
    const numEnemies = newWave * 5;
    const enemyHealth = ENEMY_CONFIG.virus.health + newWave * 10;
    const newQueue = [];
    for (let i = 0; i < numEnemies; i++) {
      newQueue.push({ type: 'virus', health: enemyHealth });
    }
    spawnQueueRef.current = newQueue;
    spawnTimerRef.current = 1000;
  };
// --- MODIFIED: The entire gameLoop is refactored ---
  const gameLoop = useCallback(() => {
    // We check gameState here to prevent loops from running after game over
    if (gameState !== 'playing') return;

    // --- 0. Create temporary holders for new state ---
    // These will collect all changes to apply at the end.
    let newProjectiles = [];
    let newMoney = money;
    let newScore = score;
    let newHealth = health;
    let enemiesToSpawn = [];
    
    // --- 1. Update Towers (Fire Projectiles) ---
    // Read the *current* towers state
    const updatedTowers = towers.map(tower => {
      let newCooldown = tower.fireCooldown - GAME_TICK_MS;
      // Read the *current* enemies state
      let target = enemies.find(e => e.id === tower.targetId); 

      // Find new target if current one is dead or out of range
      if (!target || getDistance(tower, target) > tower.range) {
        target = null;
        let closestDist = tower.range;
        // Read the *current* enemies state
        for (const enemy of enemies) { 
          const dist = getDistance(tower, enemy);
          if (dist <= closestDist) {
            closestDist = dist;
            target = enemy;
          }
        }
      }
      
      // Fire if target found and cooldown ready
      if (target && newCooldown <= 0) {
        newCooldown = tower.fireRate; // Reset cooldown
        // Push to temporary array instead of calling setProjectiles
        newProjectiles.push({
          id: `proj_${entityId++}`,
          x: tower.x,
          y: tower.y,
          damage: tower.damage,
          targetId: target.id,
          speed: 5,
        });
        return { ...tower, fireCooldown: newCooldown, targetId: target.id };
      }
      
      return { ...tower, fireCooldown: newCooldown, targetId: target?.id };
    });

    // --- 2. Update Projectiles (Move & Hit) ---
    // Copy *current* enemies to track hits this tick
    let enemiesAfterHits = [...enemies]; 
    const remainingProjectiles = [];

    // Read *current* projectiles state
    for (const p of projectiles) { 
      const target = enemiesAfterHits.find(e => e.id === p.targetId);
      if (!target) continue; // Target is dead, projectile fades

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < p.speed) {
        // Hit target
        enemiesAfterHits = enemiesAfterHits.map(e => 
          e.id === p.targetId ? { ...e, health: e.health - p.damage } : e
        );
      } else {
        // Move towards target
        remainingProjectiles.push({
          ...p,
          x: p.x + (dx / dist) * p.speed,
          y: p.y + (dy / dist) * p.speed,
        });
      }
    }

    // --- 3. Update Enemies (Move & Check State) ---
    const remainingEnemies = [];
    for (const e of enemiesAfterHits) { // Use the array from step 2
      // A. Check for death
      if (e.health <= 0) {
        newMoney += e.money;
        newScore += 10;
        continue;
      }
      
      // B. Check for reaching end
      if (e.waypointIndex >= path.length) {
        newHealth -= 1;
        continue;
      }

      // C. Move along path
      const target = path[e.waypointIndex];
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist < e.speed) {
        remainingEnemies.push({ ...e, x: target.x, y: target.y, waypointIndex: e.waypointIndex + 1 });
      } else {
        remainingEnemies.push({
          ...e,
          x: e.x + (dx / dist) * e.speed,
          y: e.y + (dy / dist) * e.speed,
        });
      }
    }

    // --- 4. Spawn Enemies ---
    if (waveInProgress && spawnQueueRef.current.length > 0) {
      spawnTimerRef.current -= GAME_TICK_MS;
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
    
    // --- 5. Apply All State Updates Once ---
    // This is the safest way to update state that depends on other state.
    setTowers(updatedTowers);
    setEnemies([...remainingEnemies, ...enemiesToSpawn]);
    setProjectiles([...remainingProjectiles, ...newProjectiles]);
    setHealth(newHealth);
    setMoney(newMoney);
    setScore(newScore);

    // --- 6. Check for Game/Wave End ---
    if (newHealth <= 0) {
      handleGameOver(false);
      return;
    }

    if (waveInProgress && remainingEnemies.length === 0 && enemiesToSpawn.length === 0 && spawnQueueRef.current.length === 0) {
      setWaveInProgress(false);
      setMoney(m => m + 100 + wave * 10);
      if (wave >= MAX_WAVES) {
        handleGameOver(true);
      }
    }
    
  }, [
    // --- THIS IS THE MOST IMPORTANT PART OF THE FIX ---
    // By adding these, the gameLoop function rebuilds itself
    // whenever these values change, so it's no longer "stale".
    gameState, 
    enemies, 
    towers, 
    projectiles, 
    health, 
    money, 
    score, 
    wave, 
    waveInProgress
  ]); // <-- End of useCallback dependency array

  // Main Game Loop Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = setInterval(gameLoop, GAME_TICK_MS);
    return () => clearInterval(loop);
  }, [gameState, gameLoop]); // This hook runs the loop


  // --- MODIFIED: Click/Touch Handlers ---

  const handleSelectTower = (type) => {
    const config = TOWER_CONFIG[type];
    if (money >= config.cost) {
      setPlacingTowerType(type);
      setPlacementPos(null); // Clear old position
    } else {
      console.log("Not enough money!");
    }
  };

  // NEW: Function to update the touch/mouse position
  // This is the same logic from your BlockTheHazeGame
  const updatePlacementPos = (event) => {
    if (!gameAreaRef.current) return;

    const { pageX, pageY } = event.nativeEvent;

    gameAreaRef.current.measure((fx, fy, width, height, px, py) => {
      if (width === 0 && height === 0) return; // measure() can return 0s
      
      const x = pageX - px;
      const y = pageY - py;

      // Clamp position inside game area
      const clampedX = Math.max(0, Math.min(GAME_AREA_WIDTH, x));
      const clampedY = Math.max(0, Math.min(GAME_AREA_HEIGHT, y));

      setPlacementPos({ x: clampedX, y: clampedY });
    });
  };

  // MODIFIED: This is now called on touch *release*
  const handlePlaceTower = () => {
    // Only place if we are in placement mode and have a valid position
    if (!placingTowerType || !placementPos) {
        // If user just taps to de-select, clear placement
        if (placingTowerType) {
            setPlacingTowerType(null);
            setPlacementPos(null);
        }
        return;
    };

    const config = TOWER_CONFIG[placingTowerType];
    
    // TODO: Add grid snapping and check for valid placement (not on path)
    
    setTowers(prev => [
      ...prev,
      {
        id: `tower_${entityId++}`,
        ...config,
        x: placementPos.x, // Use state position
        y: placementPos.y, // Use state position
        fireCooldown: 0,
        targetId: null,
      },
    ]);
    setMoney(m => m - config.cost);
    setPlacingTowerType(null);
    setPlacementPos(null); // Clear preview
  };

  // --- 3. Render Functions ---

  // RENDER: Ready Screen (Unchanged)
  if (gameState === 'ready') {
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameReadyContainer}>
          <ShieldAlert size={50} color="#3B82F6" style={appStyles.leakGameIcon} />
          <Text style={appStyles.gameTitle}>A/C Tower Defense</Text>
          <Text style={appStyles.gameSubtitle}>
            Defend your system from oncoming viruses!
          </Text>
          <View style={appStyles.leakGameHowTo}>
            <Text style={appStyles.leakGameHowToTitle}>How to Play:</Text>
            <Text style={appStyles.leakGameHowToText}>• Buy A/C Towers to place on the map.</Text>
            <Text style={appStyles.leakGameHowToText}>• Towers automatically attack viruses.</Text>
            <Text style={appStyles.leakGameHowToText}>• Stop viruses from reaching the end!</Text>
            <Text style={appStyles.leakGameHowToText}>• Survive {MAX_WAVES} waves to win.</Text>
          </View>
          <TouchableOpacity onPress={startGame} style={appStyles.leakGameStartButton}>
            <Text style={appStyles.leakGameStartButtonText}>
              {isPracticeMode ? 'Start Practice' : 'Start Defense'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // RENDER: Game Over / Win Screen (Unchanged)
  if (gameState === 'gameover' || gameState === 'gamewin') {
    const isWin = gameState === 'gamewin';
    return (
      <View style={appStyles.gameCard}>
        <View style={appStyles.leakGameOverContainer}>
          {isWin ? (
            <CheckCircle size={50} color="#10B981" style={appStyles.leakGameIcon} />
          ) : (
            <XCircle size={50} color="#EF4444" style={appStyles.leakGameIcon} />
          )}
          <Text style={appStyles.gameTitle}>{isWin ? 'System Secured!' : 'Game Over'}</Text>
          <Text style={appStyles.leakGameFinalScore}>{score}</Text>
          <Text style={appStyles.gameSubtitle}>Final Score</Text>
          <TouchableOpacity onPress={resetGame} style={appStyles.leakGameStartButton}>
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
      {/* Stats Header (Unchanged) */}
      <View style={appStyles.leakGameHeader}>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Health</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: '#28a745' }]}>
            <Heart size={16} color="#28a745" /> {health}
          </Text>
        </View>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Money</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: '#ffc107' }]}>
            <Coins size={16} color="#ffc107" /> {money}
          </Text>
        </View>
        <View style={appStyles.leakGameHeaderItem}>
          <Text style={appStyles.leakGameHeaderLabel}>Wave</Text>
          <Text style={[appStyles.leakGameHeaderValue, { color: '#17a2b8' }]}>
            <Waves size={16} color="#17a2b8" /> {wave}/{MAX_WAVES}
          </Text>
        </View>
      </View>

      {/* MODIFIED: Game Area (now a View with responder props) */}
      <View
        ref={gameAreaRef}
        style={localStyles.gameArea}
        onStartShouldSetResponder={() => true} // Always capture taps
        onResponderGrant={updatePlacementPos}  // Set initial pos on touch down
        onResponderMove={updatePlacementPos}   // Update pos on drag
        onResponderRelease={handlePlaceTower} // Place tower on touch up
      >
        {/* Draw Path (Unchanged) */}
        {path.map((p, i) =>
          i < path.length - 1 ? (
            <View
              key={`path_${i}`}
              style={[
                localStyles.pathSegment,
                {
                  left: Math.min(p.x, path[i + 1].x),
                  top: Math.min(p.y, path[i + 1].y),
                  width: Math.abs(p.x - path[i + 1].x) || 5,
                  height: Math.abs(p.y - path[i + 1].y) || 5,
                },
              ]}
            />
          ) : null
        )}

        {/* Draw Towers (Unchanged) */}
        {towers.map(tower => (
          <View
            key={tower.id}
            style={[
              localStyles.tower,
              { left: tower.x - tower.size / 2, top: tower.y - tower.size / 2, width: tower.size, height: tower.size },
            ]}
          >
            {tower.icon('white')}
          </View>
        ))}

        {/* Draw Enemies (Unchanged) */}
        {enemies.map(enemy => (
          <View
            key={enemy.id}
            style={[
              localStyles.enemy,
              { left: enemy.x - enemy.size / 2, top: enemy.y - enemy.size / 2, width: enemy.size, height: enemy.size },
            ]}
          >
            {enemy.icon('white')}
            <View style={localStyles.healthBarOuter}>
              <View style={[localStyles.healthBarInner, { width: `${(enemy.health / enemy.maxHealth) * 100}%` }]} />
            </View>
          </View>
        ))}
        
        {/* Draw Projectiles (Unchanged) */}
        {projectiles.map(p => (
          <View
            key={p.id}
            style={[
              localStyles.projectile,
              { left: p.x - 3, top: p.y - 3 },
            ]}
          />
        ))}

        {/* MODIFIED: Draw Tower Placement Preview */}
        {placingTowerType && placementPos && (
          <View
            style={[
              localStyles.towerPreview,
              {
                width: TOWER_CONFIG[placingTowerType].range * 2,
                height: TOWER_CONFIG[placingTowerType].range * 2,
                // Position preview based on finger position
                left: placementPos.x - TOWER_CONFIG[placingTowerType].range,
                top: placementPos.y - TOWER_CONFIG[placingTowerType].range,
              },
            ]}
          >
            {/* Added a small icon in the center of the preview */}
            <View style={[
              localStyles.towerPreviewIcon,
              { 
                width: TOWER_CONFIG[placingTowerType].size,
                height: TOWER_CONFIG[placingTowerType].size,
              }
            ]}>
                {TOWER_CONFIG[placingTowerType].icon('rgba(255,255,255,0.7)')}
            </View>
          </View>
        )}
      </View>

      {/* UI Controls (Unchanged) */}
      <View style={localStyles.controlsContainer}>
        <TouchableOpacity
          style={localStyles.controlButton}
          onPress={() => handleSelectTower('acTower')}
        >
          {TOWER_CONFIG.acTower.icon('#3B82F6')}
          <Text style={localStyles.controlButtonText}>
            A/C Tower (${TOWER_CONFIG.acTower.cost})
          </Text>
          {placingTowerType === 'acTower' && <View style={localStyles.selectedIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[appStyles.startButton, { flex: 1, marginLeft: 10 }]}
          onPress={startWave}
          disabled={waveInProgress}
        >
          <Text style={appStyles.startButtonText}>
            {waveInProgress ? `Wave ${wave} in Progress...` : `Start Wave ${wave + 1}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- 4. Local Styles ---

const localStyles = StyleSheet.create({
  gameArea: {
    height: GAME_AREA_HEIGHT,
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#374151',
  },
  pathSegment: {
    position: 'absolute',
    backgroundColor: '#4B5563',
  },
  tower: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  enemy: {
    position: 'absolute',
    backgroundColor: '#EF4444',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthBarOuter: {
    position: 'absolute',
    top: -6,
    height: 4,
    width: '100%',
    backgroundColor: '#4B5563',
    borderRadius: 2,
  },
  healthBarInner: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  projectile: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0E94F9',
  },
  towerPreview: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.8)',
    borderWidth: 1,
    borderRadius: 1000, // Large number for circle
    alignItems: 'center',
    justifyContent: 'center',
    // Removed static positioning
  },
  towerPreviewIcon: {
    // NEW: Style for the icon in the center of the range preview
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  controlButton: {
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  controlButtonText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
  selectedIndicator: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  }
});

export default TowerDefenseGame;