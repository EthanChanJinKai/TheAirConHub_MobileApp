import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text, // RN Text
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
// Import SVG components
import Svg, { G, Path, Text as SvgText } from 'react-native-svg'; // Correct import
import { Dices, CheckCircle, RotateCcw } from "lucide-react-native";
import { styles as appStyles } from "../../styles/AppStyles";

const screenWidth = Dimensions.get("window").width;
const wheelDiameter = Math.min(screenWidth * 0.8, 300);
const wheelRadius = wheelDiameter / 2;
const pointerSize = 25;

// Define the segments of the wheel
const segments = [
    // Ensure keys are unique if values repeat
  { value: 10, color: "#f87171", key: "red1" },     // Red
  { value: 5, color: "#fbbf24", key: "amber1" },    // Amber
  { value: 20, color: "#34d399", key: "emerald" }, // Emerald
  { value: 0, color: "#9ca3af", key: "gray" },    // Gray
  { value: 15, color: "#60a5fa", key: "blue" },    // Blue
  { value: 25, color: "#a78bfa", key: "violet" },  // Violet (Jackpot)
  { value: 5, color: "#fdba74", key: "orange" },    // Orange
  { value: 10, color: "#f472b6", key: "pink" },    // Pink
];
const numSegments = segments.length;
const segmentAngleDegrees = 360 / numSegments;

// Helper: Degrees to Radians
const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

// Helper: Polar to Cartesian for SVG (0 degrees = top, positive clockwise)
const getCoordinatesForAngle = (angleInDegrees, radius) => {
  const angleInRadians = degreesToRadians(angleInDegrees - 90);
  const x = radius * Math.cos(angleInRadians);
  const y = radius * Math.sin(angleInRadians);
  return { x, y };
};

// Function to generate SVG path data for a wedge
const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = getCoordinatesForAngle(startAngle, radius);
  const end = getCoordinatesForAngle(endAngle, radius);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  // Prevents arc issues if start/end are identical after modulo operations
  const endAngleAdjusted = endAngle === startAngle ? endAngle - 0.001 : endAngle;
  const endAdjusted = getCoordinatesForAngle(endAngleAdjusted, radius);

  const d = [
    "M", 0, 0,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, endAdjusted.x, endAdjusted.y,
    "Z"
  ].join(" ");
  return d;
};


const WheelOfFortuneGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState("ready");
  const [spinResultValue, setSpinResultValue] = useState(null);
  const spinValue = useRef(new Animated.Value(0)).current;
  const accumulatedAngle = useRef(0);

  useEffect(() => {
     spinValue.setValue(0);
     accumulatedAngle.current = 0;
     setGameState("ready");
     setSpinResultValue(null);
     const listenerId = spinValue.addListener(({ value }) => { });
     return () => {
       spinValue.removeAllListeners();
     };
  }, []);

  const spinWheel = () => {
    if (gameState === "spinning") return;
    setGameState("spinning");
    setSpinResultValue(null);

    const randomStopOffset = Math.random() * 360;
    const fullRotations = 5 + Math.floor(Math.random() * 5);
    const targetRotation = accumulatedAngle.current + (fullRotations * 360 + randomStopOffset);

    Animated.timing(spinValue, {
      toValue: targetRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) {
        accumulatedAngle.current = targetRotation;
        const finalAngle = targetRotation % 360;
        const angleUnderPointer = (360 - finalAngle) % 360;
        const winningIndex = Math.floor(angleUnderPointer / segmentAngleDegrees);
        const resultIndex = winningIndex % numSegments;
        const result = segments[resultIndex].value;

        setSpinResultValue(result);
        setGameState("finished");

        if (!isPracticeMode && result > 0) {
          onEarnPoints(result);
        }
      } else {
         setGameState("ready");
      }
    });
  };

  const resetGame = () => {
    setGameState("ready");
    setSpinResultValue(null);
  };

  const wheelRotation = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // --- Ensure ALL text outside SVG uses RN <Text> ---
  const spinButtonText = gameState === 'spinning' ? "Spinning..." : "Spin the Wheel!";
  const spinAgainButtonText = "Spin Again";
  const backToGamesButtonText = "Back to Games";
  const resultLandedText = "You landed on: ";
  const resultPointsText = `${spinResultValue} points!`;
  const practiceCompleteText = "Practice spin complete.";
  const noPointsText = "No points this time.";
  const pointsAddedText = `+${spinResultValue} points added!`;
  // ---

  return (
    <View style={appStyles.gameCard}>
      <Text style={appStyles.gameTitle}>Wheel of Fortune</Text>
      <Text style={appStyles.gameSubtitle}>
        Spin the wheel to earn points! Land on violet for the jackpot.
      </Text>

      <View style={localStyles.wheelContainer}>
        {/* Pointer */}
        <View style={localStyles.pointerContainer}>
           <View style={localStyles.pointer} />
        </View>

        {/* Wheel using SVG */}
        <Animated.View
            style={{
                width: wheelDiameter,
                height: wheelDiameter,
                transform: [{ rotate: wheelRotation }],
            }}
        >
             <Svg
                 height={wheelDiameter}
                 width={wheelDiameter}
                 viewBox={`0 0 ${wheelDiameter} ${wheelDiameter}`}
             >
                {/* Center the group */}
                <G x={wheelRadius} y={wheelRadius}>
                  {segments.map((segment, index) => {
                    const startAngle = segmentAngleDegrees * index;
                    const endAngle = startAngle + segmentAngleDegrees;
                    const pathData = describeArc(0, 0, wheelRadius - 1.5, startAngle, endAngle); // Use radius-1.5 for inset

                    // Calculate text position: angle in middle of segment
                    const textAngleDegrees = startAngle + segmentAngleDegrees / 2;
                    const textRadius = wheelRadius * 0.6; // Position text ~60% out
                    const textCoord = getCoordinatesForAngle(textAngleDegrees, textRadius);

                    // --- CORRECTED RADIAL TEXT ROTATION ---
                    // Rotate text by its midpoint angle to align along the radius
                    const textRotation = textAngleDegrees;
                    // --- END TEXT ROTATION LOGIC ---

                    // Explicitly cast segment value to string
                    const segmentValueString = String(segment.value);

                    return (
                      // Note: No <G> wrapping Path/Text needed if rotation applied directly to Text
                      <React.Fragment key={segment.key || index}>
                         <Path
                             d={pathData}
                             fill={segment.color}
                             stroke="#ffffff"
                             strokeWidth={2}
                         />
                         <SvgText
                            x={textCoord.x}
                            y={textCoord.y}
                             // Apply the radial rotation around the text's coordinate
                            transform={`rotate(${textRotation}, ${textCoord.x}, ${textCoord.y})`}
                            fill="#ffffff"
                            fontSize="16"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >
                           {segmentValueString}
                         </SvgText>
                      </React.Fragment> // Use Fragment instead of G if G isn't needed for grouping transforms
                    );
                  })}
                 </G>
             </Svg>
        </Animated.View>
      </View>

      {/* Spin Button & Result Display */}
       <View style={localStyles.controlsContainer}>
        {gameState === "ready" && (
          <TouchableOpacity
            style={appStyles.startButton}
            onPress={spinWheel}
          >
            <Text style={appStyles.startButtonText}>{spinButtonText}</Text>
          </TouchableOpacity>
        )}
        {gameState === "spinning" && (
           <TouchableOpacity
            style={[appStyles.startButton, appStyles.buttonDisabled]}
            disabled={true}
          >
            <Text style={appStyles.startButtonText}>{spinButtonText}</Text>
          </TouchableOpacity>
        )}
        {gameState === "finished" && (
          <View style={localStyles.resultContainer}>
             <CheckCircle size={30} color="#10b981" />
            <Text style={localStyles.resultText}>
              {resultLandedText}
              <Text style={{ fontWeight: "bold" }}>{resultPointsText}</Text>
            </Text>
            {!isPracticeMode && spinResultValue > 0 && (
                 <Text style={[appStyles.successText, {marginBottom: 10}]}>{pointsAddedText}</Text>
            )}
             {!isPracticeMode && spinResultValue === 0 && (
                 <Text style={[appStyles.warningText, {marginBottom: 10}]}>{noPointsText}</Text>
            )}
             {isPracticeMode && (
                 <Text style={[appStyles.infoText, {marginBottom: 10}]}>{practiceCompleteText}</Text>
            )}
            <View style={localStyles.buttonRow}>
                 <TouchableOpacity
                     style={[appStyles.secondaryButton, localStyles.flexButton]}
                     onPress={resetGame}
                 >
                     <RotateCcw size={16} color="#4b5563"/>
                     <Text style={appStyles.secondaryButtonText}>{spinAgainButtonText}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                     style={[appStyles.backToHubButton, localStyles.flexButton]}
                     onPress={onEndGame}
                 >
                     <Text style={appStyles.backToHubButtonText}>{backToGamesButtonText}</Text>
                 </TouchableOpacity>
             </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Styles remain the same
const localStyles = StyleSheet.create({
    wheelContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 25,
        height: wheelDiameter + pointerSize, // Make space for pointer top margin
        position: 'relative',
        marginBottom: 20,
      },
       pointerContainer: {
        position: 'absolute',
        top: -pointerSize * 0.4, // Position pointer slightly above the wheel
        left: '50%',
        marginLeft: -pointerSize / 2, // Center the pointer base horizontally
        zIndex: 10,
        width: pointerSize,
        height: pointerSize * 1.5,
        alignItems: 'center',
       },
      pointer: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: pointerSize / 2.5,
        borderRightWidth: pointerSize / 2.5,
        borderBottomWidth: pointerSize * 0.9,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#374151", // Pointer color
        transform: [{ rotate: "180deg" }], // Point it downwards
      },
      controlsContainer: {
        marginTop: 15,
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 10,
      },
      resultContainer: {
        alignItems: "center",
        paddingVertical: 10,
      },
      resultText: {
        fontSize: 18,
        fontWeight: "500",
        color: "#374151",
        marginVertical: 8,
        textAlign: 'center'
      },
       buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
       },
       flexButton: {
        flex: 1,
        marginHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
       }
});

export default WheelOfFortuneGame;

