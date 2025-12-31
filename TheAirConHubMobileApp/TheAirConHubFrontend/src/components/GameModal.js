import React, { useState, useEffect } from "react";
import { View, Modal, ScrollView, TouchableOpacity } from "react-native";
import { X, Sparkles, Dices, Wrench, Search, CloudOff, Castle } from "lucide-react-native";
import { styles } from "../styles/AppStyles";

// Import Toast
import ToastMessage from "./ToastMessage"; // Ensure this path is correct

// Import Games
import BrokenPipelineGame from "./games/BrokenPipelineGame";
import FindTheLeakGame from "./games/FindTheLeakGame";
import BlockTheHazeGame from "./games/BlockTheHazeGame";
import WheelOfFortuneGame from "./games/GachaponGame";
import TowerDefenseGame from "./games/TowerDefenseGame";
import CleanTheCoilGame from "./games/CleanTheCoilGame";
import GameHubScreen from "./games/GameHubScreen";

// NOTE: Added toast props
const GameModal = ({ 
  visible, 
  onClose, 
  onEarnPoints, 
  initialGameKey, 
  onStartGame,
  toastVisible,  // New Prop
  toastMessage,  // New Prop
  onHideToast    // New Prop
}) => {
  const [activeGameKey, setActiveGameKey] = useState(initialGameKey || null);
  const [currentSlotKey, setCurrentSlotKey] = useState(initialGameKey || null);

  const minigames = [
    { name: "Gachapon", key: "wheel", bonus: "0 - 100 Points", iconComponent: <Dices size={40} color="#3B82F6" /> },
    { name: "Broken Pipeline", key: "sequence", bonus: "10 - 50 Points", iconComponent: <Wrench size={40} color="#3B82F6" /> },
    { name: "Find the Leak", key: "leak", bonus: "10 - 50 Points", iconComponent: <Search size={40} color="#3B82F6" /> },
    { name: "Block the Haze", key: "block", bonus: "0 - 50 Points", iconComponent: <CloudOff size={40} color="#3B82F6" /> },
    { name: "Clean the Coil", key: "tap", bonus: "0 - 50 Points", iconComponent: <Sparkles size={40} color="#3B82F6" /> },
    { name: "A/C Tower Defense", key: "towerDefense", bonus: "10 - 50 Points", iconComponent: <Castle size={40} color="#3B82F6" /> },
  ];

  useEffect(() => {
    if (visible) {
      setActiveGameKey(null);
      setCurrentSlotKey(initialGameKey);
    } else {
      setActiveGameKey(null);
      setCurrentSlotKey(null);
    }
  }, [visible, initialGameKey]);

  const handleEndGame = () => {
    setActiveGameKey(null);
  }

  const handleSelectGame = async (gameKey) => {
    if (gameKey === 'practice') {
        setActiveGameKey(gameKey);
        return;
    }

    // Call API check
    if (onStartGame) {
        const canPlay = await onStartGame(); 
        if (!canPlay) return; // Toast will trigger here!
    }

    setActiveGameKey(gameKey);
  }

  const handleEarnPointsInGame = (points) => {
    onEarnPoints(points, currentSlotKey);
  }

  const renderActiveGameComponent = () => {
    const isPracticeMode = currentSlotKey === "practice";

    switch (activeGameKey) {
      case "tap": return <CleanTheCoilGame onEarnPoints={handleEarnPointsInGame} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      case "sequence": return <BrokenPipelineGame onEarnPoints={handleEarnPointsInGame} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      case "leak": return <FindTheLeakGame onEarnPoints={handleEarnPointsInGame} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      case "block": return <BlockTheHazeGame onEarnPoints={handleEarnPointsInGame} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      case "wheel": return <WheelOfFortuneGame onEarnPoints={handleEarnPointsInGame} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;
      case "towerDefense": return <TowerDefenseGame onEarnPoints={handleEarnPointsInGame} onEndGame={handleEndGame} isPracticeMode={isPracticeMode} />;  
      default: return <GameHubScreen games={minigames} onSelectGame={handleSelectGame} currentSlotKey={currentSlotKey} />;
    }
  };

  const needsScrollView = activeGameKey !== null; 

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.gameModalContainer}>
        
        {/* Header */}
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={activeGameKey ? handleEndGame : onClose} style={styles.closeButton}>
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {needsScrollView ? (
          <ScrollView contentContainerStyle={styles.gameContent} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
            {renderActiveGameComponent()}
          </ScrollView>
        ) : (
           <View style={styles.gameContent}> 
             {renderActiveGameComponent()}
           </View>
        )}

        {/* --- RENDER TOAST INSIDE MODAL --- */}
        <ToastMessage 
          visible={toastVisible} 
          message={toastMessage} 
          onHide={onHideToast} 
        />

      </View>
    </Modal>
  );
};

export default GameModal;