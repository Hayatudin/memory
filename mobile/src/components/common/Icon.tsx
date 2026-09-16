import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { Theme } from "../../theme/index";

export type IconName =
  | "home"
  | "search"
  | "user"
  | "user-circle"
  | "sparkles"
  | "bell"
  | "bell-fill"
  | "camera"
  | "plus"
  | "mic"
  | "arrow-up-right"
  | "chevron-right"
  | "chevron-left"
  | "menu"
  | "link"
  | "video"
  | "lightbulb"
  | "tv"
  | "diamond"
  | "music"
  | "tech"
  | "book"
  | "copy"
  | "shield"
  | "refresh"
  | "upload"
  | "lock"
  | "info"
  | "message"
  | "moon"
  | "arrow-up"
  | "send"
  | "close"
  | "pin"
  | "edit"
  | "trash"
  | "folder"
  | "more-horizontal"
  | "more-vertical";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = Theme.colors.textPrimary,
  strokeWidth = 2,
}) => {
  switch (name) {
    case "home":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.25L12 3l9 7.25v10a.75.75 0 01-.75.75H14.5v-6a2.5 2.5 0 00-5 0v6H3.75a.75.75 0 01-.75-.75v-10z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "search":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="11"
            cy="11"
            r="7"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M20 20l-4-4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "user":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="8"
            r="4"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "user-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="9.5" r="3" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M6.8 17.8c0-2.3 2.3-4.1 5.2-4.1s5.2 1.8 5.2 4.1"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "sparkles":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2z"
            fill={color}
          />
          <Path
            d="M19 15l1.1 2.9L23 19l-2.9 1.1L19 23l-1.1-2.9L15 19l2.9-1.1L19 15z"
            fill={color}
          />
        </Svg>
      );

    case "bell":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "bell-fill":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25-2.25 7-2.25 7h18.5S19 14.25 19 9c0-3.87-3.13-7-7-7zm0 20c1.38 0 2.5-1.12 2.5-2.5h-5c0 1.38 1.12 2.5 2.5 2.5z"
            fill={color}
          />
        </Svg>
      );

    case "camera":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="12"
            cy="13"
            r="4"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Svg>
      );

    case "plus":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5v14M5 12h14"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "mic":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19 10v1a7 7 0 01-14 0v-1M12 19v3M8 22h8"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "arrow-up-right":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 17L17 7M7 7h10v10"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "chevron-right":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18l6-6-6-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "chevron-left":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "menu":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 6h16M4 12h16M4 18h16"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "link":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "video":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Film frame */}
          <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth={1.8} />
          {/* Left sprocket notches */}
          <Rect x="5.5" y="5.5" width="2" height="2" rx="0.5" fill={color} />
          <Rect x="5.5" y="11" width="2" height="2" rx="0.5" fill={color} />
          <Rect x="5.5" y="16.5" width="2" height="2" rx="0.5" fill={color} />
          {/* Right sprocket notches */}
          <Rect x="16.5" y="5.5" width="2" height="2" rx="0.5" fill={color} />
          <Rect x="16.5" y="11" width="2" height="2" rx="0.5" fill={color} />
          <Rect x="16.5" y="16.5" width="2" height="2" rx="0.5" fill={color} />
          {/* Center Play Triangle */}
          <Path d="M10.5 9.5l4.5 2.5-4.5 2.5V9.5z" fill={color} />
        </Svg>
      );

    case "lightbulb":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2v2M5 5l1.4 1.4M19 5l-1.4 1.4M9 19h6M10 22h4M12 6a6 6 0 00-6 6c0 2.2 1.2 4.1 3 5.2V18a1 1 0 001 1h4a1 1 0 001-1v-.8c1.8-1.1 3-3 3-5.2a6 6 0 00-6-6z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "tv":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="7"
            width="18"
            height="13"
            rx="2"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M8 3l4 4 4-4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "diamond":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 3h12l4 6-10 12L2 9l4-6z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "music":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "tech":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="6" cy="6" r="3" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="18" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="18" cy="6" r="3" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M6 9v6a3 3 0 003 3h6M15 6H9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "book":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "copy":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "shield":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "refresh":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M23 4v6h-6M1 20v-6h6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "upload":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "lock":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="11"
            width="18"
            height="11"
            rx="2"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M7 11V7a5 5 0 0110 0v4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "info":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M12 16v-4M12 8h.01"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "message":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "moon":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "arrow-up":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 19V5M5 12l7-7 7 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "send":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "close":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 6L6 18M6 6l12 12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "pin":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 3h10v2.5h-1v3l2 4v1.5H13v7h-2v-7H6V14l2-4V5.5H7V3z"
            fill={color}
          />
        </Svg>
      );

    case "edit":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "trash":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "folder":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "more-horizontal":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Circle cx="12" cy="12" r="2.2" />
          <Circle cx="19" cy="12" r="2.2" />
          <Circle cx="5" cy="12" r="2.2" />
        </Svg>
      );

    case "more-vertical":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Circle cx="12" cy="12" r="2.2" />
          <Circle cx="12" cy="5" r="2.2" />
          <Circle cx="12" cy="19" r="2.2" />
        </Svg>
      );

    default:
      return null;
  }
};
