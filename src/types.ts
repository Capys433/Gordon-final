export interface KeybindingConfig {
  label: string;
  code: string;
}

export interface Keybindings {
  moveForward: KeybindingConfig;
  moveBackward: KeybindingConfig;
  moveLeft: KeybindingConfig;
  moveRight: KeybindingConfig;
  jump: KeybindingConfig;
  interact: KeybindingConfig;
  flashlight: KeybindingConfig;
}

export type GameScreen = 'main' | 'settings' | 'controls' | 'pause' | 'hud';

export type MiniGameType = null | 'NOTE' | 'BALLOON_POP' | 'HIGH_STRIKER';

export interface AttractionData {
  id: string;
  name: string;
  pos: { x: number; y: number; z: number };
  radius: number;
  actionText: string;
}

export interface Settings {
  sensitivity: number;
  fov: number;
  flashlightBrightness: number;
  volume: number;
}
