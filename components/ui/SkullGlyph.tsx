import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Minimal skull icon for elimination states.
 * Stroke-based → works on any background without a fill-hole workaround.
 * Keep it small (16–28px) as an accent glyph, not a hero illustration.
 */
export function SkullGlyph({
  size = 24,
  color = Colors.danger,
  strokeWidth = 2,
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cranium */}
      <Path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
      {/* Jaw */}
      <Path d="M8 20v2h8v-2" />
      {/* Left eye socket */}
      <Circle cx="9" cy="12" r="1.5" />
      {/* Right eye socket */}
      <Circle cx="15" cy="12" r="1.5" />
      {/* Nose */}
      <Path d="M12 14v2" />
    </Svg>
  );
}
