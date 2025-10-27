import React from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Path, Line } from "react-native-svg";
import { styles } from "../../../styles/AppStyles";

const { width } = Dimensions.get("window");
const isDesktop = width >= 768;

const getResponsiveStyles = () => {
  if (isDesktop) {
    return {
      waveWidth: 400,
      waveHeight: 120,
    };
  } else {
    return {
      waveWidth: 280,
      waveHeight: 80,
    };
  }
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
              key={`top-${i}`}
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
              key={`bottom-${i}`}
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

export default SineWaveDisplay;
