import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  ScrollView,
  Modal,
  Pressable,
  Image
} from 'react-native';

import * as Haptics from 'expo-haptics';

// region Images

const images = {
  START_HOR: require('../../../assets/pipelines/entrancepipe_hor.png'),
  START_VERT: require('../../../assets/pipelines/entrancepipe_vert.png'),
  END_HOR: require('../../../assets/pipelines/exitpipe_hor.png'),
  END_VERT: require('../../../assets/pipelines/exitpipe_vert.png'),
  STRAIGHT: {
    HORIZONTAL: require('../../../assets/pipelines/ipipe_plain_horizontal.png'),
    VERTICAL: require('../../../assets/pipelines/ipipe_plain_vertical.png'),
  },
  STRAIGHT_RAT: [
    require('../../../assets/pipelines/ipipe_rat_top.png'),
    require('../../../assets/pipelines/ipipe_rat_right.png'),
    require('../../../assets/pipelines/ipipe_rat_bottom.png'),
    require('../../../assets/pipelines/ipipe_rat_left.png'),
  ],
  
  L_BEND_PLAIN: [
    require('../../../assets/pipelines/lpipe_plain_topright.png'),  
    require('../../../assets/pipelines/lpipe_plain_bottomright.png'),
    require('../../../assets/pipelines/lpipe_plain_bottomleft.png'), 
    require('../../../assets/pipelines/lpipe_plain_topleft.png'),   
  ],

  L_BEND_LIZ: [
    require('../../../assets/pipelines/lpipe_liz_topright.png'),    
    require('../../../assets/pipelines/lpipe_liz_bottomright.png'), 
    require('../../../assets/pipelines/lpipe_liz_bottomleft.png'), 
    require('../../../assets/pipelines/lpipe_liz_topleft.png'),   
  ]
};

// endregion Images 
// region End Images 
// endregion End Images

const STAGE_CONFIG = {
  1: { rows: 4, cols: 4, start: { r: 0, c: 0 }, end: { r: 3, c: 3 }, minPathLength: 7, numRatPipes: 1, numLizPipes: 1 },
  2: { rows: 5, cols: 5, start: { r: 0, c: 0 }, end: { r: 4, c: 4 }, minPathLength: 12, numRatPipes: 2, numLizPipes: 2 },
  3: { rows: 6, cols: 6, start: { r: 0, c: 0 }, end: { r: 5, c: 5 }, minPathLength: 20, numRatPipes: 3, numLizPipes: 3 },
};

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const gameAreaSize = Math.min(windowWidth * 0.9, windowHeight * 0.7);

// --- Game Logic ---

const getDir = (from, to) => {
  if (to.r < from.r) return 'TOP';
  if (to.r > from.r) return 'BOTTOM';
  if (to.c < from.c) return 'LEFT';
  if (to.c > from.c) return 'RIGHT';
  return null;
};

const getPipeFromOpenings = (openings) => {
  const [o1, o2] = openings.sort();

  if (o1 === 'BOTTOM' && o2 === 'TOP') return { type: 'STRAIGHT', rotation: 1 }; // Vertical
  if (o1 === 'LEFT' && o2 === 'RIGHT') return { type: 'STRAIGHT', rotation: 0 }; // Horizontal
  

  if (o1 === 'RIGHT' && o2 === 'TOP') return { type: 'L_BEND', rotation: 0 };
  if (o1 === 'BOTTOM' && o2 === 'RIGHT') return { type: 'L_BEND', rotation: 1 };
  if (o1 === 'BOTTOM' && o2 === 'LEFT') return { type: 'L_BEND', rotation: 2 };
  if (o1 === 'LEFT' && o2 === 'TOP') return { type: 'L_BEND', rotation: 3 };

  return { type: 'STRAIGHT', rotation: 0 };
};

const getTerminalRotation = (dir) => {
  if (dir === 'TOP') return 0;
  if (dir === 'RIGHT') return 1;
  if (dir === 'BOTTOM') return 2;
  if (dir === 'LEFT') return 3;
  return 0;
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const createInitialLevel = (stage) => {
  const { rows, cols, start, end, minPathLength, numRatPipes, numLizPipes } = STAGE_CONFIG[stage];

  // 1. Fill grid with random junk pipes first
  const grid = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => {
      const rand = Math.random();
      let type;
      // 96% chance for normal pipes (48% each)
      if (rand < 0.48) {
        type = 'STRAIGHT';
      } else if (rand < 0.96) {
        type = 'L_BEND';
      }
      // 3% chance for T_BEND
      else if (rand < 0.99) {
        type = 'T_BEND';
      }
      // 1% chance for CROSS
      else {
        type = 'CROSS';
      }

      return {
        type: type,
        rotation: Math.floor(Math.random() * 4),
        isConnected: false,
        isFixed: false,
      };
    })
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
      return true;
    }

    const neighbors = [
      { r: r - 1, c: c },
      { r: r + 1, c: c },
      { r: r, c: c - 1 },
      { r: r, c: c + 1 }
    ];
    shuffleArray(neighbors);

    for (const n of neighbors) {
      if (dfs(n.r, n.c)) {
        return true;
      }
    }

    path.pop();
    return false;
  };

  let pathFound = false;
  while (!pathFound) {
    path.length = 0;
    visited.clear();

    const success = dfs(start.r, start.c);

    if (success && path.length >= minPathLength) {
      pathFound = true;
    }
  }

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
      
      const { type: baseType, rotation: baseRotation } = getPipeFromOpenings([dir1, dir2]);
      
      let finalType = baseType;
      let finalRotation = baseRotation;

      let upgradeChance = 0;
      if (stage === 2) upgradeChance = 0.1;
      if (stage === 3) upgradeChance = 0.2;

      if (Math.random() < upgradeChance) {
        const randType = Math.random();
        
        if (randType < 0.7) { 
          finalType = 'T_BEND';
          if (baseType === 'STRAIGHT') {
            finalRotation = (baseRotation === 0) ? (Math.random() < 0.5 ? 0 : 2) : (Math.random() < 0.5 ? 1 : 3);
          } else {
            if (baseRotation === 0) finalRotation = Math.random() < 0.5 ? 0 : 3;
            else if (baseRotation === 1) finalRotation = Math.random() < 0.5 ? 0 : 1;
            else if (baseRotation === 2) finalRotation = Math.random() < 0.5 ? 1 : 2;
            else if (baseRotation === 3) finalRotation = Math.random() < 0.5 ? 2 : 3;
          }
        } 
        else {
          finalType = 'CROSS';
          finalRotation = 0;
        }
      }
      
      grid[pos.r][pos.c] = { type: finalType, rotation: finalRotation, isFixed: false, isConnected: false };
      solutionRotations[posKey] = finalRotation;
    }
  }

  // 4. Randomize rotations of non-fixed pipes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isFixed) continue;

      const posKey = `${r},${c}`;
      const solutionRotation = solutionRotations[posKey];

      if (solutionRotation !== undefined) {
        let newRotation = Math.floor(Math.random() * 4);
        while (newRotation === solutionRotation) {
          newRotation = Math.floor(Math.random() * 4);
        }
        grid[r][c].rotation = newRotation;
      } else {
        grid[r][c].rotation = Math.floor(Math.random() * 4);
      }
    }
  }
  
  // 5. Add fixed obstacles for Stage 3
  if (stage === 3) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const posKey = `${r},${c}`;
        if (grid[r][c].type === 'START' || grid[r][c].type === 'END' || solutionRotations.hasOwnProperty(posKey)) {
          continue;
        }
        
        if (Math.random() < 0.25) {
          grid[r][c].isFixed = true;
        }
      }
    }
  }
  
  // --- NEW: Step 6 - Find and assign rat pipes ---
  const straightPipeCoords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'STRAIGHT') {
        straightPipeCoords.push({ r, c });
      }
    }
  }

  
  const numberOfRatPipes = numRatPipes;

  // Pick N random pipes
  for (let i = 0; i < numberOfRatPipes; i++) {
    // Stop if we run out of straight pipes
    if (straightPipeCoords.length === 0) {
      break; 
    }
    
    const randomIndex = Math.floor(Math.random() * straightPipeCoords.length);
    // Select and remove the pipe from the list to avoid picking it twice
    const [ selectedPipe ] = straightPipeCoords.splice(randomIndex, 1); 
    
    grid[selectedPipe.r][selectedPipe.c].isRatPipe = true;
  }
  // --- END NEW ---

  // --- NEW: Step 7 - Find and assign lizard pipes ---
  const lBendPipeCoords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'L_BEND') {
        lBendPipeCoords.push({ r, c });
      }
    }
  }

  // Define how many lizard pipes you want (from config)
  const numberOfLizPipes = numLizPipes;

  // Pick N random pipes
  for (let i = 0; i < numberOfLizPipes; i++) {
    // Stop if we run out of L-bend pipes
    if (lBendPipeCoords.length === 0) {
      break; 
    }
    
    const randomIndex = Math.floor(Math.random() * lBendPipeCoords.length);
    // Select and remove the pipe from the list to avoid picking it twice
    const [ selectedPipe ] = lBendPipeCoords.splice(randomIndex, 1); 
    
    grid[selectedPipe.r][selectedPipe.c].isLizPipe = true;
  }
  // --- END NEW ---

  return grid;
};

// --- getOpenings (Unchanged from "View" version) ---
const getOpenings = (piece) => {
  if (!piece) return [];

  const { type, rotation } = piece;

  switch (type) {
    case 'START':
      if (rotation === 0) return ['TOP'];
      if (rotation === 1) return ['RIGHT'];
      if (rotation === 2) return ['BOTTOM'];
      if (rotation === 3) return ['LEFT'];
      return [];

    case 'END':
      if (rotation === 0) return ['TOP'];
      if (rotation === 1) return ['RIGHT'];
      if (rotation === 2) return ['BOTTOM'];
      if (rotation === 3) return ['LEFT'];
      return [];

    case 'STRAIGHT':
      
      return rotation % 2 === 0 ? ['LEFT', 'RIGHT'] : ['TOP', 'BOTTOM'];

    case 'L_BEND':
      // Matches the new image array order
      if (rotation === 0) return ['TOP', 'RIGHT'];
      if (rotation === 1) return ['RIGHT', 'BOTTOM'];
      if (rotation === 2) return ['BOTTOM', 'LEFT'];
      if (rotation === 3) return ['LEFT', 'TOP'];
      return [];

    case 'T_BEND':
      if (rotation === 0) return ['TOP', 'RIGHT', 'BOTTOM'];
      if (rotation === 1) return ['RIGHT', 'BOTTOM', 'LEFT'];
      if (rotation === 2) return ['BOTTOM', 'LEFT', 'TOP'];
      if (rotation === 3) return ['LEFT', 'TOP', 'RIGHT'];
      return [];

    case 'CROSS':
      return ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];

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


// --- CUSTOM ALERT COMPONENT (Unchanged) ---

const CustomAlert = ({ visible, title, message, buttons }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        const RNE_alert_button_action = buttons.find(b => b.style === 'cancel') || buttons[0];
        if (RNE_alert_button_action && RNE_alert_button_action.onPress) {
          RNE_alert_button_action.onPress();
        }
      }}
    >
      <Pressable style={styles.alertBackdrop}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.alertButtonRow}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'cancel' ? styles.alertButtonCancel : styles.alertButtonPrimary,
                  buttons.length > 1 && { flex: 1 }
                ]}
                onPress={button.onPress}
              >
                <Text style={[
                  styles.alertButtonText,
                  button.style === 'cancel' ? styles.alertButtonTextCancel : styles.alertButtonTextPrimary
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// --- Main Game Component ---

export default function BrokenPipelineGame() {
  const [currentStage, setCurrentStage] = useState(1);
  const [grid, setGrid] = useState(() => createInitialLevel(currentStage));
  const [stageWon, setStageWon] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', buttons: [] });

  const { rows, cols, start, end } = STAGE_CONFIG[currentStage];

  // --- dynamicSize (REMOVED startNode/endNode) ---
  const dynamicSize = useMemo(() => {
    const cellSize = Math.floor(gameAreaSize / cols);
    const pipeWidth = Math.floor(cellSize * 0.2);
    const pipeCenterSize = pipeWidth;

    const pipeStubLengthAndOffset = Math.floor((cellSize - pipeWidth) / 2);

    return {
      cell: { width: cellSize, height: cellSize },
      pipeCenter: { 
        width: pipeCenterSize, 
        height: pipeCenterSize,
        top: pipeStubLengthAndOffset,
        left: pipeStubLengthAndOffset
      },
      pipeStubTop: {
        width: pipeWidth,
        height: pipeStubLengthAndOffset,
        top: 0,
        left: pipeStubLengthAndOffset
      },
      pipeStubBottom: {
        width: pipeWidth,
        height: pipeStubLengthAndOffset,
        bottom: 0,
        left: pipeStubLengthAndOffset
      },
      pipeStubLeft: {
        width: pipeStubLengthAndOffset,
        height: pipeWidth,
        left: 0,
        top: pipeStubLengthAndOffset
      },
      pipeStubRight: {
        width: pipeStubLengthAndOffset,
        height: pipeWidth,
        right: 0,
        top: pipeStubLengthAndOffset
      },
    };
  }, [cols, gameAreaSize]);

  const advanceToNextStage = useCallback(() => {
    const nextStage = currentStage + 1;
    if (nextStage > 3) {
      setGameFinished(true);
      return;
    }
    setCurrentStage(nextStage);
    setGrid(createInitialLevel(nextStage));
    setStageWon(false);
  }, [currentStage]);

  const resetGame = useCallback(() => {
    setCurrentStage(1);
    setGrid(createInitialLevel(1));
    setStageWon(false);
    setGameFinished(false);
  }, []);

  const handlePress = (r, c) => {
    if (stageWon || gameFinished || grid[r][c].isFixed) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

  // --- useEffect (Unchanged) ---
  useEffect(() => {
    if (stageWon || gameFinished) return;

    const { rows: currentRows, cols: currentCol, start: currentStart } = STAGE_CONFIG[currentStage];

    const checkConnections = (currentGrid) => {
      const newGrid = currentGrid.map(row =>
        row.map(cell => ({ ...cell, isConnected: false }))
      );

      let win = false;
      const q = [currentStart];
      const visited = new Set([`${currentStart.r},${currentStart.c}`]);
      newGrid[currentStart.r][currentStart.c].isConnected = true;

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

          if (nr < 0 || nr >= currentRows || nc < 0 || nc >= currentCol) {
            continue;
          }
          if (visited.has(neighborPosKey)) {
            continue;
          }

          const neighborPiece = newGrid[nr][nc];
          const neighborOpenings = getOpenings(neighborPiece);
          const oppositeDir = getOppositeDir(dir);

          if (neighborOpenings.includes(oppositeDir)) {
            newGrid[nr][nc].isConnected = true;
            visited.add(neighborPosKey);
            q.push({ r: nr, c: nc });

            if (neighborPiece.type === 'END') {
              win = true;
            }
          }
        }
      }

      let connectionsChanged = false;
      for (let r = 0; r < currentRows; r++) {
        for (let c = 0; c < currentCol; c++) {
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

      if (win && !stageWon) {
        setStageWon(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (currentStage < 3) {
          setAlertConfig({
            title: `Stage ${currentStage} Complete!`,
            message: "Get ready for the next level!",
            buttons: [
              {
                text: "Let's Go!",
                onPress: () => {
                  setIsAlertVisible(false);
                  advanceToNextStage();
                }
              }
            ]
          });
          setIsAlertVisible(true);
        } else {
          setGameFinished(true);
          setAlertConfig({
            title: "All Stages Complete!",
            message: "You're a master plumber!",
            buttons: [
              {
                text: "Play Again",
                onPress: () => {
                  setIsAlertVisible(false);
                  resetGame();
                }
              }
            ]
          });
          setIsAlertVisible(true);
        }
      }
    };

    checkConnections(grid);

  }, [grid, currentStage, stageWon, gameFinished, advanceToNextStage, resetGame]);

  

  // region RenderCell
  
 const renderCell = (piece, r, c) => {
    if (!piece) return <View style={[styles.cell, dynamicSize.cell]} />;

    const openings = getOpenings(piece);
    const has = (dir) => openings.includes(dir);
    const connectedStyle = piece.isConnected ? styles.pipeConnected : null;
    const fixedStyle = piece.isFixed ? styles.cellFixed : null;

    let imageSource = null;
    let imageTintColor = null;
    let rotationDeg = 0; // Default to no rotation

    if (piece.type === 'START') {
      if (piece.rotation === 1) { // 1 = RIGHT
        imageSource = images.START_HOR;
      } else if (piece.rotation === 2) { // 2 = BOTTOM
        imageSource = images.START_VERT;
      } else if (piece.rotation === 3) { // 3 = LEFT
        imageSource = images.START_HOR;
        rotationDeg = 180; // Flip 180deg
      } else { // 0 = TOP
        imageSource = images.START_VERT;
        rotationDeg = 180; // Flip 180deg
      }
    } else if (piece.type === 'END') {
      if (piece.rotation === 3) { // 3 = LEFT
        imageSource = images.END_HOR;
      } else if (piece.rotation === 0) { // 0 = TOP
        imageSource = images.END_VERT;
      } else if (piece.rotation === 1) { // 1 = RIGHT
        imageSource = images.END_HOR;
        rotationDeg = 180; // Flip 180deg
      } else { // 2 = BOTTOM
        imageSource = images.END_VERT;
        rotationDeg = 180; // Flip 180deg
      }
      
      if (piece.isConnected) { imageTintColor = '#28a745'; }

    } else if (piece.type === 'STRAIGHT') {
      
      if (piece.isRatPipe) {
        imageSource = images.STRAIGHT_RAT[piece.rotation];
      } else {
        if (piece.rotation % 2 === 0) { // Horizontal
          imageSource = images.STRAIGHT.HORIZONTAL;
        } else { // Vertical
          imageSource = images.STRAIGHT.VERTICAL;
        }
      }
      rotationDeg = 0;
    
    // --- UPDATED: L_BEND LOGIC ---
    } else if (piece.type === 'L_BEND') {
      if (piece.isLizPipe) {
        imageSource = images.L_BEND_LIZ[piece.rotation];
      } else {
        imageSource = images.L_BEND_PLAIN[piece.rotation];
      }
      rotationDeg = 0;
    }
    // --- END UPDATED L_BEND LOGIC ---

    return (
      <TouchableOpacity
        key={`${r}-${c}`}
        style={[styles.cell, dynamicSize.cell, fixedStyle]}
        onPress={() => handlePress(r, c)}
        activeOpacity={piece.isFixed ? 1.0 : 0.7}
      >
        {/* 1. Render Image Layer (START, END, STRAIGHT, OR L_BEND) */}
        {imageSource && (
          <Image
            style={[
              styles.pipeImage,
              dynamicSize.cell,
              { transform: [{ rotate: `${rotationDeg}deg` }] }
            ]}
            source={imageSource}
            resizeMode="contain"
            tintColor={imageTintColor}
          />
        )}

        {/* 2. Render View Layer (T_BEND, CROSS, AND all centers/stubs) */}
        
        {/* Center (for STRAIGHT, L_BEND, T_BEND, CROSS) */}
        {piece.type !== 'START' && piece.type !== 'END' && (
          <View style={[styles.pipeCenter, dynamicSize.pipeCenter, connectedStyle]} />
        )}

        {/* Stubs (for ALL types, shows the "water") */}
        {has('TOP') && <View style={[styles.pipeStub, dynamicSize.pipeStubTop, connectedStyle]} />}
        {has('BOTTOM') && <View style={[styles.pipeStub, dynamicSize.pipeStubBottom, connectedStyle]} />}
        {has('LEFT') && <View style={[styles.pipeStub, dynamicSize.pipeStubLeft, connectedStyle]} />}
        {has('RIGHT') && <View style={[styles.pipeStub, dynamicSize.pipeStubRight, connectedStyle]} />}
      </TouchableOpacity>
    );
  };

  // endregion renderCell
  // region End RenderCell
  // endregion End RenderCell

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />

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
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cellFixed: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  // --- NEW: Style for START/END images ---
  pipeImage: {
    position: 'absolute',
  },
  // --- END NEW ---
  pipeCenter: {
    position: 'absolute', // Centered manually by dynamicSize
    backgroundColor: '#888',
    // borderRadius: 0, // Removed for sharp corners
  },
  pipeStub: {
    position: 'absolute',
    backgroundColor: '#888',
  },
  pipeConnected: {
    backgroundColor: '#007bff',
  },
  // --- REMOVED: startNode, endNode, endNodeConnected ---
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

  // --- STYLES for CustomAlert ---
  alertBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  alertButtonPrimary: {
    backgroundColor: '#007bff',
  },
  alertButtonCancel: {
    backgroundColor: '#f1f1f1',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertButtonTextPrimary: {
    color: '#fff',
  },
  alertButtonTextCancel: {
    color: '#333',
  },
});