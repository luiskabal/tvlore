import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 38 }: BrandMarkProps) {
  return (
    <Svg
      accessibilityLabel="TVLore logo"
      accessible
      height={size}
      viewBox="0 0 64 64"
      width={size}
    >
      <Defs>
        <LinearGradient id="brandFrame" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#F7F7FA" />
          <Stop offset="0.52" stopColor="#F7F7FA" />
          <Stop offset="0.8" stopColor="#B56CFF" />
          <Stop offset="1" stopColor="#7C3AED" />
        </LinearGradient>
        <LinearGradient id="brandPlay" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#B56CFF" />
          <Stop offset="1" stopColor="#7C3AED" />
        </LinearGradient>
      </Defs>

      <Rect
        fill="#0D1420"
        height="58"
        rx="17"
        stroke="#283246"
        strokeWidth="1.5"
        width="58"
        x="3"
        y="3"
      />
      <Path
        d="M29 15 21 7M35 15l8-8"
        fill="none"
        stroke="#F7F7FA"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <Path
        d="M17 38V24c0-5.5 4.5-10 10-10h12c5.5 0 10 4.5 10 10v10"
        fill="none"
        stroke="url(#brandFrame)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <Path
        d="M17 36v3c0 5.5 4.5 10 10 10h11"
        fill="none"
        stroke="#F7F7FA"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <Path d="m28 24 12 8-12 8Z" fill="url(#brandPlay)" />
      <Path
        d="m39 43 6 6 11-13"
        fill="none"
        stroke="#A855F7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
    </Svg>
  );
}
