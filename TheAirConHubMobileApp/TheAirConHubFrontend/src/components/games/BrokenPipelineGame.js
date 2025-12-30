import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  ScrollView,
  Modal,
  Pressable,
  Image,
} from "react-native";

import { Wrench, CheckCircle } from "lucide-react-native"; 
import * as Haptics from "expo-haptics";
import { styles } from "../../styles/AppStyles"; // Ensure this import is correct


const { width } = Dimensions.get("window");
const isDesktop = width >= 768;

// region Images
const images = {
  START_HOR: require("../../../assets/pipelines/entrancepipe_hor.png"),
  START_VERT: require("../../../assets/pipelines/entrancepipe_vert.png"),
  END_HOR: require("../../../assets/pipelines/exitpipe_hor.png"),
  END_VERT: require("../../../assets/pipelines/exitpipe_vert.png"),
  STRAIGHT: {
    HORIZONTAL: require("../../../assets/pipelines/ipipe_plain_horizontal.png"),
    VERTICAL: require("../../../assets/pipelines/ipipe_plain_vertical.png"),
  },
  STRAIGHT_RAT: [
    require("../../../assets/pipelines/ipipe_rat_top.png"),
    require("../../../assets/pipelines/ipipe_rat_right.png"),
    require("../../../assets/pipelines/ipipe_rat_bottom.png"),
    require("../../../assets/pipelines/ipipe_rat_left.png"),
  ],

  L_BEND_PLAIN: [
    require("../../../assets/pipelines/lpipe_plain_topright.png"),
    require("../../../assets/pipelines/lpipe_plain_bottomright.png"),
    require("../../../assets/pipelines/lpipe_plain_bottomleft.png"),
    require("../../../assets/pipelines/lpipe_plain_topleft.png"),
  ],

  L_BEND_LIZ: [
    require("../../../assets/pipelines/lpipe_liz_topright.png"),
    require("../../../assets/pipelines/lpipe_liz_bottomright.png"),
    require("../../../assets/pipelines/lpipe_liz_bottomleft.png"),
    require("../../../assets/pipelines/lpipe_liz_topleft.png"),
  ],

  T_BEND_PLAIN: [
    require("../../../assets/pipelines/tpipe_plain_left.png"),
    require("../../../assets/pipelines/tpipe_plain_down.png"),
    require("../../../assets/pipelines/tpipe_plain_right.png"),
    require("../../../assets/pipelines/tpipe_plain_up.png"),
  ],

  T_BEND_WEB: [
    require("../../../assets/pipelines/tpipe_web_left.png"),
    require("../../../assets/pipelines/tpipe_web_up.png"),
    require("../../../assets/pipelines/tpipe_web_right.png"),
    require("../../../assets/pipelines/tpipe_web_down.png"),
  ],

  CROSS_VARIANTS: [
    require("../../../assets/pipelines/crosspipe_plain.png"), 
    require("../../../assets/pipelines/crosspipe_v2.png"), 
    require("../../../assets/pipelines/crosspipe_v3.png"), 
    require("../../../assets/pipelines/crosspipe_v4.png"), 
  ],
};

//region Map Generation Logic
const STAGE_CONFIG = {
  1: { 
    rows: 4,
    cols: 4,
    start: { r: 0, c: 0 },
    end: { r: 3, c: 3 },
    minPathLength: 7,
    numRatPipes: 1,
    numLizPipes: 1,
    numWebPipes: 0,
    points: 10, // Points for clearing stage 1
  },
  2: { 
    rows: 5,
    cols: 5,
    start: { r: 0, c: 0 },
    end: { r: 4, c: 4 },
    minPathLength: 12,
    numRatPipes: 3,
    numLizPipes: 1,
    numWebPipes: 1,
    points: 30, // Points for clearing stage 2
  },
  3: { 
    rows: 6,
    cols: 6,
    start: { r: 0, c: 0 },
    end: { r: 5, c: 5 },
    minPathLength: 20,
    numRatPipes: 5,
    numLizPipes: 2,
    numWebPipes: 1,
    points: 50, // Points for clearing stage 3
  },
};

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const gameAreaSize = Math.min(windowWidth * 0.9, windowHeight * 0.7);

const getDir = (from, to) => {
  if (to.r < from.r) return "TOP";
  if (to.r > from.r) return "BOTTOM";
  if (to.c < from.c) return "LEFT";
  if (to.c > from.c) return "RIGHT";
  return null;
};

const getPipeFromOpenings = (openings) => {
  const [o1, o2] = openings.sort(); 

  if (o1 === "BOTTOM" && o2 === "TOP") return { type: "STRAIGHT", rotation: 1 }; 
  if (o1 === "LEFT" && o2 === "RIGHT") return { type: "STRAIGHT", rotation: 0 }; 

  if (o1 === "RIGHT" && o2 === "TOP") return { type: "L_BEND", rotation: 0 };
  if (o1 === "BOTTOM" && o2 === "RIGHT") return { type: "L_BEND", rotation: 1 };
  if (o1 === "BOTTOM" && o2 === "LEFT") return { type: "L_BEND", rotation: 2 };
  if (o1 === "LEFT" && o2 === "TOP") return { type: "L_BEND", rotation: 3 };

  return { type: "STRAIGHT", rotation: 0 };
};

const getTerminalRotation = (dir) => {
  if (dir === "TOP") return 0;
  if (dir === "RIGHT") return 1;
  if (dir === "BOTTOM") return 2;
  if (dir === "LEFT") return 3;
  return 0;
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const createInitialLevel = (stage) => {
  const {
    rows,
    cols,
    start,
    end,
    minPathLength,
    numRatPipes,
    numLizPipes,
    numWebPipes,
  } = STAGE_CONFIG[stage];

  const grid = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => {
          const rand = Math.random();
          let type;
          if (rand < 0.48) { 
            type = "STRAIGHT";
          } else if (rand < 0.96) {
            type = "L_BEND";
          }
          else if (rand < 0.99) {
            type = "T_BEND";
          } 
          else {
            if (stage === 1) {
              type = "CROSS";
            } else {
              type = "L_BEND";
            }
          }

          const piece = {
            type: type,
            rotation: Math.floor(Math.random() * 4),
            isConnected: false,
            isFixed: false,
          };

          if (piece.type === "CROSS") {
            piece.variant = Math.floor(
              Math.random() * images.CROSS_VARIANTS.length
            ); 
          }

          return piece;
        })
    );

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
      { r: r, c: c + 1 },
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

  const solutionRotations = {};
  for (let i = 0; i < path.length; i++) {
    const pos = path[i];
    const posKey = `${pos.r},${pos.c}`;

    if (i === 0) {
      const dir = getDir(pos, path[i + 1]);
      const rotation = getTerminalRotation(dir);
      grid[pos.r][pos.c] = {
        type: "START",
        rotation,
        isFixed: true,
        isConnected: true,
      };
    } else if (i === path.length - 1) {
      const dir = getDir(pos, path[i - 1]);
      const rotation = getTerminalRotation(dir);
      grid[pos.r][pos.c] = {
        type: "END",
        rotation,
        isFixed: true,
        isConnected: false,
      };
    } else {
      const dir1 = getDir(pos, path[i - 1]);
      const dir2 = getDir(pos, path[i + 1]);

      const { type: baseType, rotation: baseRotation } = getPipeFromOpenings([
        dir1,
        dir2,
      ]);

      let finalType = baseType;
      let finalRotation = baseRotation;

      let upgradeChance = 0;
      if (stage === 2) upgradeChance = 0.1;
      if (stage === 3) upgradeChance = 0.2;

      if (Math.random() < upgradeChance) {
        const randType = Math.random();

        if (randType < 0.7) {
          finalType = "T_BEND";
          if (baseType === "STRAIGHT") {
            if (baseRotation === 0) finalRotation = Math.random() < 0.5 ? 0 : 2;
            else finalRotation = Math.random() < 0.5 ? 1 : 3;
          } else {
            if (baseRotation === 0) finalRotation = Math.random() < 0.5 ? 2 : 3;
            else if (baseRotation === 1)
              finalRotation = Math.random() < 0.5 ? 0 : 3;
            else if (baseRotation === 2)
              finalRotation = Math.random() < 0.5 ? 0 : 1;
            else if (baseRotation === 3)
              finalRotation = Math.random() < 0.5 ? 1 : 2;
          }
        } else {
          finalType = "CROSS";
          finalRotation = 0;
        }
      }
      const newPiece = {
        type: finalType,
        rotation: finalRotation,
        isFixed: false,
        isConnected: false,
      };

      if (newPiece.type === "CROSS") {
        newPiece.variant = Math.floor(
          Math.random() * images.CROSS_VARIANTS.length
        );
      }
      grid[pos.r][pos.c] = newPiece;
      solutionRotations[posKey] = finalRotation;
    }
  }

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

  const straightPipeCoords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === "STRAIGHT") {
        straightPipeCoords.push({ r, c });
      }
    }
  }
  const numberOfRatPipes = numRatPipes;
  for (let i = 0; i < numberOfRatPipes; i++) {
    if (straightPipeCoords.length === 0) break;
    const randomIndex = Math.floor(Math.random() * straightPipeCoords.length);
    const [selectedPipe] = straightPipeCoords.splice(randomIndex, 1);
    grid[selectedPipe.r][selectedPipe.c].isRatPipe = true;
  }

  const lBendPipeCoords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === "L_BEND") {
        lBendPipeCoords.push({ r, c });
      }
    }
  }
  const numberOfLizPipes = numLizPipes;
  for (let i = 0; i < numberOfLizPipes; i++) {
    if (lBendPipeCoords.length === 0) break;
    const randomIndex = Math.floor(Math.random() * lBendPipeCoords.length);
    const [selectedPipe] = lBendPipeCoords.splice(randomIndex, 1);
    grid[selectedPipe.r][selectedPipe.c].isLizPipe = true;
  }

  const tBendPipeCoords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === "T_BEND" && !grid[r][c].isFixed) {
        tBendPipeCoords.push({ r, c });
      }
    }
  }
  const numberOfWebPipes = numWebPipes;
  for (let i = 0; i < numberOfWebPipes; i++) {
    if (tBendPipeCoords.length === 0) break;
    const randomIndex = Math.floor(Math.random() * tBendPipeCoords.length);
    const [selectedPipe] = tBendPipeCoords.splice(randomIndex, 1);
    grid[selectedPipe.r][selectedPipe.c].isWebPipe = true;
  }

  return grid;
};

const getOpenings = (piece) => {
  if (!piece) return [];

  const { type, rotation } = piece;

  switch (type) {
    case "START":
    case "END":
      if (rotation === 0) return ["TOP"];
      if (rotation === 1) return ["RIGHT"];
      if (rotation === 2) return ["BOTTOM"];
      if (rotation === 3) return ["LEFT"];
      return [];

    case "STRAIGHT":
      return rotation % 2 === 0 ? ["LEFT", "RIGHT"] : ["TOP", "BOTTOM"];

    case "L_BEND":
      if (rotation === 0) return ["TOP", "RIGHT"];
      if (rotation === 1) return ["RIGHT", "BOTTOM"];
      if (rotation === 2) return ["BOTTOM", "LEFT"];
      if (rotation === 3) return ["LEFT", "TOP"];
      return [];

    case "T_BEND":
      if (rotation === 0) return ["BOTTOM", "LEFT", "TOP"]; 
      if (rotation === 1) return ["LEFT", "TOP", "RIGHT"]; 
      if (rotation === 2) return ["TOP", "RIGHT", "BOTTOM"]; 
      if (rotation === 3) return ["RIGHT", "BOTTOM", "LEFT"]; 
      return [];

    case "CROSS":
      return ["TOP", "BOTTOM", "LEFT", "RIGHT"];

    default:
      return [];
  }
};

const getOppositeDir = (dir) => {
  if (dir === "TOP") return "BOTTOM";
  if (dir === "BOTTOM") return "TOP";
  if (dir === "LEFT") return "RIGHT";
  if (dir === "RIGHT") return "LEFT";
};

// --- CUSTOM ALERT COMPONENT ---
const CustomAlert = ({ visible, title, message, buttons }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        const RNE_alert_button_action =
          buttons.find((b) => b.style === "cancel") || buttons[0];
        if (RNE_alert_button_action && RNE_alert_button_action.onPress) {
          RNE_alert_button_action.onPress();
        }
      }}
    >
      <Pressable style={localStyles.alertBackdrop}>
        <View style={localStyles.alertContainer}>
          <Text style={localStyles.alertTitle}>{title}</Text>
          <Text style={localStyles.alertMessage}>{message}</Text>
          <View style={localStyles.alertButtonRow}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  localStyles.alertButton,
                  button.style === "cancel"
                    ? localStyles.alertButtonCancel
                    : localStyles.alertButtonPrimary,
                  buttons.length > 1 && { flex: 1 },
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    localStyles.alertButtonText,
                    button.style === "cancel"
                      ? localStyles.alertButtonTextCancel
                      : localStyles.alertButtonTextPrimary,
                  ]}
                >
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

//region --- Main Game Component ---

export default function BrokenPipelineGame({
  onEarnPoints,
  onEndGame,
  isPracticeMode,
}) {
  const [gameState, setGameState] = useState("ready");
  const [currentStage, setCurrentStage] = useState(1);
  const [grid, setGrid] = useState(() => createInitialLevel(1)); 
  const [stageWon, setStageWon] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [],
  });

  const { rows, cols, start, end } = STAGE_CONFIG[currentStage];

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
        left: pipeStubLengthAndOffset,
      },
      pipeStubTop: {
        width: pipeWidth,
        height: pipeStubLengthAndOffset,
        top: 0,
        left: pipeStubLengthAndOffset,
      },
      pipeStubBottom: {
        width: pipeWidth,
        height: pipeStubLengthAndOffset,
        bottom: 0,
        left: pipeStubLengthAndOffset,
      },
      pipeStubLeft: {
        width: pipeStubLengthAndOffset,
        height: pipeWidth,
        left: 0,
        top: pipeStubLengthAndOffset,
      },
      pipeStubRight: {
        width: pipeStubLengthAndOffset,
        height: pipeWidth,
        right: 0,
        top: pipeStubLengthAndOffset,
      },
    };
  }, [cols, gameAreaSize]);

  //region --- Game Flow Functions ---

  const startGame = useCallback(() => {
    setCurrentStage(1);
    setGrid(createInitialLevel(1));
    setStageWon(false);
    setGameFinished(false);
    setGameState("playing");
  }, []);

  const resetGame = useCallback(() => {
    setCurrentStage(1);
    setGrid(createInitialLevel(1));
    setStageWon(false);
    setGameFinished(false);
    setGameState("ready"); 
  }, []);

  const finishGame = useCallback(() => {
    onEndGame();
  }, [onEndGame]);

  const advanceToNextStage = useCallback(() => {
    const nextStage = currentStage + 1;
    if (nextStage > 3) {
      setGameFinished(true);
      setGameState("gameover");
      return;
    }
    setCurrentStage(nextStage);
    setGrid(createInitialLevel(nextStage));
    setStageWon(false);
  }, [currentStage]);

  const handlePress = (r, c) => {
    if (
      gameState !== "playing" ||
      stageWon ||
      gameFinished ||
      grid[r][c].isFixed
    ) {
      return;
    }

    if (grid[r][c].type === "CROSS") {
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

  useEffect(() => {
    if (gameState !== "playing" || stageWon || gameFinished) return;

    const {
      rows: currentRows,
      cols: currentCol,
      start: currentStart,
    } = STAGE_CONFIG[currentStage];

    const checkConnections = (currentGrid) => {
      const newGrid = currentGrid.map((row) =>
        row.map((cell) => ({ ...cell, isConnected: false }))
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

          if (dir === "TOP") nr--;
          if (dir === "BOTTOM") nr++;
          if (dir === "LEFT") nc--;
          if (dir === "RIGHT") nc++;

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

            if (neighborPiece.type === "END") {
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

        // --- NEW SCORING LOGIC HERE ---
        const stagePoints = STAGE_CONFIG[currentStage].points;
        if (!isPracticeMode) {
          onEarnPoints(stagePoints);
        }

        if (currentStage < 3) {
          setAlertConfig({
            title: `Stage ${currentStage} Complete!`,
            message: `You fixed the pipe and earned ${stagePoints} points!\nGet ready for the next level!`,
            buttons: [
              {
                text: "Let's Go!",
                onPress: () => {
                  setIsAlertVisible(false);
                  advanceToNextStage();
                },
              },
            ],
          });
          setIsAlertVisible(true);
        } else {
          setGameFinished(true);
          setGameState("gameover");
          setAlertConfig({
            title: "All Stages Complete!",
            message: `You earned ${stagePoints} points for the final stage!\nYou're a master plumber!`,
            buttons: [
              {
                text: "Play Again",
                onPress: () => {
                  setIsAlertVisible(false);
                  resetGame();
                },
              },
              {
                text: "Back to Hub",
                onPress: () => {
                  setIsAlertVisible(false);
                  finishGame();
                },
              },
            ],
          });
          setIsAlertVisible(true);
        }
      }
    };

    checkConnections(grid);
  }, [
    grid,
    currentStage,
    stageWon,
    gameFinished,
    advanceToNextStage,
    finishGame,
    gameState,
    isPracticeMode, // Added dependency
    onEarnPoints // Added dependency
  ]);

  // region RenderCell
  const renderCell = (piece, r, c) => {
    if (!piece) return <View style={[localStyles.cell, dynamicSize.cell]} />;

    const openings = getOpenings(piece);
    const has = (dir) => openings.includes(dir);
    const connectedStyle = piece.isConnected ? localStyles.pipeConnected : null;
    const fixedStyle = piece.isFixed ? localStyles.cellFixed : null;

    let imageSource = null;
    let imageTintColor = null;
    let rotationDeg = 0;

    if (piece.type === "START") {
      if (piece.rotation === 1) {
        imageSource = images.START_HOR;
      } else if (piece.rotation === 2) {
        imageSource = images.START_VERT;
      } else if (piece.rotation === 3) {
        imageSource = images.START_HOR;
        rotationDeg = 180;
      } else {
        imageSource = images.START_VERT;
        rotationDeg = 180;
      }
    } else if (piece.type === "END") {
      if (piece.rotation === 3) {
        imageSource = images.END_HOR;
      } else if (piece.rotation === 0) {
        imageSource = images.END_VERT;
      } else if (piece.rotation === 1) {
        imageSource = images.END_HOR;
        rotationDeg = 180;
      } else {
        imageSource = images.END_VERT;
        rotationDeg = 180;
      }

      if (piece.isConnected) {
        imageTintColor = "#28a745";
      }
    } else if (piece.type === "STRAIGHT") {
      if (piece.isRatPipe) {
        imageSource = images.STRAIGHT_RAT[piece.rotation];
      } else {
        if (piece.rotation % 2 === 0) {
          imageSource = images.STRAIGHT.HORIZONTAL;
        } else {
          imageSource = images.STRAIGHT.VERTICAL;
        }
      }
      rotationDeg = 0;
    } else if (piece.type === "L_BEND") {
      if (piece.isLizPipe) {
        imageSource = images.L_BEND_LIZ[piece.rotation];
      } else {
        imageSource = images.L_BEND_PLAIN[piece.rotation];
      }
      rotationDeg = 0;
    } else if (piece.type === "T_BEND") {
      if (piece.isWebPipe) {
        imageSource = images.T_BEND_WEB[piece.rotation];
      } else {
        imageSource = images.T_BEND_PLAIN[piece.rotation];
      }
      rotationDeg = 0;
    } else if (piece.type === "CROSS") {
      imageSource = images.CROSS_VARIANTS[piece.variant];
      rotationDeg = 0;
    }

    const touchableOpacityActiveOpacity =
      piece.isFixed || piece.type === "CROSS" ? 1.0 : 0.7;

    return (
      <TouchableOpacity
        key={`${r}-${c}`}
        style={[localStyles.cell, dynamicSize.cell, fixedStyle]}
        onPress={() => handlePress(r, c)}
        activeOpacity={touchableOpacityActiveOpacity}
      >
        {imageSource && (
          <Image
            style={[
              localStyles.pipeImage,
              dynamicSize.cell,
              { transform: [{ rotate: `${rotationDeg}deg` }] },
            ]}
            source={imageSource}
            resizeMode="contain"
            tintColor={imageTintColor}
          />
        )}

        {piece.type !== "START" && piece.type !== "END" && (
          <View
            style={[localStyles.pipeCenter, dynamicSize.pipeCenter, connectedStyle]}
          />
        )}

        {has("TOP") && (
          <View
            style={[localStyles.pipeStub, dynamicSize.pipeStubTop, connectedStyle]}
          />
        )}
        {has("BOTTOM") && (
          <View
            style={[
              localStyles.pipeStub,
              dynamicSize.pipeStubBottom,
              connectedStyle,
            ]}
          />
        )}
        {has("LEFT") && (
          <View
            style={[localStyles.pipeStub, dynamicSize.pipeStubLeft, connectedStyle]}
          />
        )}
        {has("RIGHT") && (
          <View
            style={[localStyles.pipeStub, dynamicSize.pipeStubRight, connectedStyle]}
          />
        )}
      </TouchableOpacity>
    );
  };

  //region --- Render Page Logic ---

  if (gameState === "ready") {
    return (
      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.centeredScrollViewContainer}
      >
        <View style={localStyles.instructionBox}>
          <Wrench size={50} color="#007bff" style={localStyles.pipeIcon} />
          <Text style={localStyles.gameTitle}>Broken Pipeline</Text>
          <Text style={localStyles.gameSubtitle}>
            Restore the flow by connecting the pipes from start to finish!
          </Text>

          <View style={localStyles.pipeHowTo}>
            <Text style={localStyles.pipeHowToTitle}>How to Play:</Text>
            <Text style={localStyles.pipeHowToText}>
              • Tap any white pipe piece to rotate it.
            </Text>
            <Text style={localStyles.pipeHowToText}>
              • Connect the pipes so the blue flow from the Start pipe reaches
              the End pipe.
            </Text>
            <Text style={localStyles.pipeHowToText}>
              • Gray pipes are fixed and cannot be rotated.
            </Text>
            <Text style={localStyles.pipeHowToText}>
              • Clear stages to earn 50, 100, and 150 points!
            </Text>
          </View>
          <TouchableOpacity onPress={startGame} style={localStyles.pipeStartButton}>
            <Text style={localStyles.pipeStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Fixing"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (gameState === "gameover") {
    return (
      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.centeredScrollViewContainer}
      >
        <View style={localStyles.instructionBox}>
          <CheckCircle size={50} color="#28a745" style={localStyles.pipeIcon} />
          <Text style={localStyles.gameTitle}>Puzzle Complete!</Text>

          <Text style={localStyles.gameSubtitle}>You solved all three stages!</Text>

          <TouchableOpacity onPress={resetGame} style={localStyles.pipeStartButton}>
            <Text style={localStyles.pipeStartButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.backToHubButton, { marginTop: 10 }]}
            onPress={finishGame}
          >
            <Text style={localStyles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={localStyles.scrollView}
      contentContainerStyle={localStyles.container}
    >
      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />

      <Text style={localStyles.title}>Pipeline Puzzle</Text>
      <Text style={localStyles.subtitle}>
        {gameFinished ? "You win!" : `Stage ${currentStage} of 3`}
      </Text>

      <View
        style={[
          localStyles.gridContainer,
          { opacity: stageWon || gameFinished ? 0.7 : 1.0 },
        ]}
      >
        {grid.map((row, r) => (
          <View key={r} style={localStyles.row}>
            {row.map((cell, c) => renderCell(cell, r, c))}
          </View>
        ))}
      </View>

      {stageWon && <Text style={localStyles.winText}>CONNECTED!</Text>}
    </ScrollView>
  );
}

//region --- Styles ---

const localStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  centeredScrollViewContainer: {
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingVertical: 20, 
    paddingHorizontal: 15,
  },
  container: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
    width: isDesktop ? 600 : '95%', 
    maxWidth: '100%',
  },
  instructionBox: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
    textAlign: "center",
  },
  gameSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  pipeIcon: {
    marginBottom: 15,
    alignSelf: "center",
  },
  pipeHowTo: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: "100%",
    alignSelf: "flex-start",
  },
  pipeHowToTitle: {
      fontWeight: 'bold', 
      fontSize: 16, 
      color: '#93C5FD', 
      marginBottom: 5 
  },
  pipeHowToText: {
      fontSize: 12,
      color: '#D1D5DB', 
      lineHeight: 18, 
  },
  pipeStartButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
  },
  pipeStartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  backToHubButton: {
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 8,
    width: '85%',
    alignSelf: 'center',
    alignItems: "center",
  },
  backToHubButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  gridContainer: {
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  cellFixed: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  pipeImage: {
    position: "absolute",
  },
  pipeCenter: {
    position: "absolute",
    backgroundColor: "#888",
  },
  pipeStub: {
    position: "absolute",
    backgroundColor: "#888",
  },
  pipeConnected: {
    backgroundColor: "#007bff",
  },
  winText: {
    position: "absolute",
    top: "50%",
    fontSize: 36, 
    fontWeight: "bold",
    color: "#28a745",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    transform: [{ rotate: "-10deg" }],
  },
  alertBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  alertButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  alertButtonPrimary: {
    backgroundColor: "#007bff",
  },
  alertButtonCancel: {
    backgroundColor: "#f1f1f1",
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  alertButtonTextPrimary: {
    color: "#fff",
  },
  alertButtonTextCancel: {
    color: "#333",
  },
});