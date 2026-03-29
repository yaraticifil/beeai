import React, { useMemo } from 'react';
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
  const width = screenWidth - 100;

  const points = useMemo(() => {
    const p = [];
    const count = 12; // More points for a smoother curve
    const mid = (min + max) / 2;

    for (let i = 0; i < count; i++) {
      // Deterministic but more "natural" looking points
      const ratio = i / (count - 1);
      const sine = Math.sin(ratio * Math.PI * 2);
      const noise = (Math.sin(ratio * 10) * 0.1);
      const val = mid + (sine * (max - min) * 0.4) + (noise * (max - min));
      p.push(Math.max(min, Math.min(max, val)));
    }
    // Ensure it hits min and max somewhere
    p[2] = min + (max - min) * 0.1;
    p[count - 2] = max;
    return p;
  }, [min, max]);

  const highest = Math.max(...points);
  const lowest = Math.min(...points);
  const range = highest - lowest || 1;
  const padding = range * 0.15;

  const drawMin = lowest - padding;
  const drawMax = highest + padding;
  const drawRange = drawMax - drawMin;

  const getX = (index: number) => (index / (points.length - 1)) * width;
  const getY = (value: number) => height - ((value - drawMin) / drawRange) * height;

  const pathData = points.reduce((acc, val, i) => {
    const x = getX(i);
    const y = getY(val);
    if (i === 0) return `M ${x} ${y}`;

    // Simple Bezier-like smoothing attempt by using midpoints or just L for simplicity in SVG
    return `${acc} L ${x} ${y}`;
  }, "");

  const areaData = `${pathData} L ${getX(points.length - 1)} ${height} L ${getX(0)} ${height} Z`;

  return (
    <View style={{ height, width, marginVertical: 15, alignSelf: 'center' }}>
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.5" />
            <Stop offset="0.7" stopColor={Colors.primary} stopOpacity="0.1" />
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
