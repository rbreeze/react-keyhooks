import * as React from "react";

export enum Key {
  TAB = 9,
  ENTER = 13,
  SHIFT = 16,
  ESCAPE = 27,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  A = 65,
  B = 66,
  C = 67,
  D = 68,
  E = 69,
  F = 70,
  G = 71,
  H = 72,
  I = 73,
  J = 74,
  K = 75,
  L = 76,
  M = 77,
  N = 78,
  O = 79,
  P = 80,
  Q = 81,
  R = 82,
  S = 83,
  T = 84,
  U = 85,
  V = 86,
  W = 87,
  X = 88,
  Y = 89,
  Z = 90,
  SLASH = 191,
  QUESTION = 191,
}

export enum NumKey {
  ZERO = 48,
  ONE = 49,
  TWO = 50,
  THREE = 51,
  FOUR = 52,
  FIVE = 53,
  SIX = 54,
  SEVEN = 55,
  EIGHT = 56,
  NINE = 57,
}

export enum NumPadKey {
  ZERO = 96,
  ONE = 97,
  TWO = 98,
  THREE = 99,
  FOUR = 100,
  FIVE = 101,
  SIX = 102,
  SEVEN = 103,
  EIGHT = 104,
  NINE = 105,
}

export type AnyNumKey = NumKey | NumPadKey;
export type AnyKeys = AnyNumKey | Key | (AnyNumKey | Key)[];

// useNav adds simple stateful navigation to your component
// Returns:
//   - pos: indicates current position
//   - nav: fxn that accepts an integer that represents number to increment/decrement pos
//   - reset: fxn that sets current position to -1
// Accepts:
//   - upperBound: maximum value that pos can grow to
//   - init: optional initial value for pos

export const useNav = (
  upperBound: number,
  init?: number
): [number, (n: number) => boolean, () => void] => {
  const [pos, setPos] = React.useState(init || -1);
  const isInBounds = (p: number): boolean => p < upperBound && p > -1;

  const nav = (val: number): boolean => {
    const newPos = pos + val;
    return isInBounds(newPos) ? setPos(newPos) === null : false;
  };

  const reset = () => {
    setPos(-1);
  };

  return [pos, nav, reset];
};

export type KeyState = { action: KeyAction; pressed: boolean; group: number };
export type KeyAction = (keyCode?: number) => boolean;
export type KeyMap = { [key: number]: KeyState };

export const useKeyListener = (): ((
  keys: AnyKeys,
  action: KeyAction,
  combo?: boolean
) => void) => {
  const groupForKey = {} as { [key: number]: number };

  const groups = {} as { [group: number]: KeyMap };
  let index = 0;

  const handlePress = (e: KeyboardEvent) => {
    const g = groupForKey[e.keyCode];
    if (groups[g]) {
      let allPressed = true;
      groups[g][e.keyCode].pressed = true;

      for (const i of Object.keys(groups[g])) {
        const k = parseInt(i, 10);
        const key = groups[g][k];

        if (!key.pressed) {
          allPressed = false;
        }
      }

      if (allPressed) {
        const prevent = groups[g][e.keyCode].action(e.keyCode);
        if (prevent) {
          e.preventDefault();
        }
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const g = groupForKey[e.keyCode];
    if (groups[g]) {
      groups[g][e.keyCode].pressed = false;
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handlePress);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handlePress);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [groupForKey, groups]);

  return (keys, a, combo) => {
    if (Array.isArray(keys)) {
      let g = index;
      for (const key of keys) {
        // create association between this key and its group
        groupForKey[key] = index;

        if (!groups[g]) {
          groups[index] = {} as KeyMap;
        }

        groups[index][key] = {
          group: g,
          action: a,
          pressed: false,
        };

        if (!combo) {
          g = g + 1;
        }
      }
      index = g + 1;
    } else {
      groupForKey[keys] = index;

      if (!groups[index]) {
        groups[index] = {} as KeyMap;
      }

      groups[index][keys] = {
        group: index,
        action: a,
        pressed: false,
      };

      index = index + 1;
    }
  };
};

export const NumKeyToNumber = (key: AnyNumKey): number => {
  if (key > 47 && key < 58) {
    return key - 48;
  } else if (key > 95 && key < 106) {
    return key - 96;
  }
  return -1;
};
