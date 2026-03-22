import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';

interface TrendChartProps {
  min: number;
  max: number;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ min, max, height = 80 }) => {
  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth - 100; // Giving some space for padding

  // Create a pseudo-random but deterministic trend based on min/max
  const mid = (min + max) / 2;
  const points = [
    min + 0.2,
    mid - 0.3,
    mid + 0.4,
    min + 0.1,
    max - 0.2,
    max,
  ];

  const highest = Math.max(...points);
  const lowest = Math.min(...points);
  const range = highest - lowest || 1;
  const padding = range * 0.2;

  const drawMin = lowest - padding;
  const drawMax = highest + padding;
  const drawRange = drawMax - drawMin;

  const getX = (index: number) => (index / (points.length - 1)) * width;
  const getY = (value: number) => height - ((value - drawMin) / drawRange) * height;

  const pathData = points.reduce((acc, val, i) => {
    const x = getX(i);
    const y = getY(val);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const areaData = `${pathData} L ${getX(points.length - 1)} ${height} L ${getX(0)} ${height} Z`;

  return (
    <View style={{ height, width, marginVertical: 15, alignSelf: 'center' }}>
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.4" />
            <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={areaData} fill="url(#grad)" />
        <Path
          d={pathData}
          fill="none"
          stroke={Colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};
