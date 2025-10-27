import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "../../styles/AppStyles";
import EntrancePipe from "../../../assets/entrancepipe.png";
import ExitPipe from "../../../assets/exitpipe.png";
import {
  PIPE_TYPES,
  WINNING_SCORE,
  START_INDEX,
  END_INDEX,
  isPathConnected,
  createInitialGridWithStartEnd,
} from "./shared/pipeHelpers";

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
          <Image
            source={EntrancePipe}
            resizeMode="contain"
            style={styles.pipeImage}
          />
        ) : /* Special rendering for END tile */
        isEnd ? (
          <Image
            source={ExitPipe}
            resizeMode="contain"
            style={styles.pipeImage}
          />
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

export default BrokenPipelineGame;