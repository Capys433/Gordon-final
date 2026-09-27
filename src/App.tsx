import { useState, useEffect, useCallback } from 'react';
import { GameScreen, Keybindings, Settings } from './types';
import { titleMusic } from './utils/audio';
import { registerSubtitleListener, speakJeffLine } from './utils/speech';
import { TitleScreen } from './components/TitleScreen';
import { SettingsMenu } from './components/SettingsMenu';
import { ControlsMenu } from './components/ControlsMenu';
import { PauseMenu } from './components/PauseMenu';
import { HUD } from './components/HUD';
import { BloodyNoteOverlay } from './components/BloodyNoteOverlay';
import { BalloonPopMinigame } from './components/BalloonPopMinigame';
import { GameCanvas } from './components/GameCanvas';

const DEFAULT_BINDINGS: Keybindings = {
  moveForward: { label: 'Move Forward', code: 'KeyW' },
  moveBackward: { label: 'Move Backward', code: 'KeyS' },
  moveLeft: { label: 'Move Left', code: 'KeyA' },
  moveRight: { label: 'Move Right', code: 'KeyD' },
  jump: { label: 'Jump', code: 'Space' },
  interact: { label: 'Interact / Pick Up', code: 'KeyE' },
  flashlight: { label: 'Toggle Flashlight', code: 'KeyF' },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('main');
  const [previousMenu, setPreviousMenu] = useState<'main' | 'pause'>('main');

  const [keybindings, setKeybindings] = useState<Keybindings>(() => {
    const saved = localStorage.getItem('gordon_scared_jeff_keybindings');
    return saved ? JSON.parse(saved) : DEFAULT_BINDINGS;
  });

  const [settings, setSettings] = useState<Settings>({
    sensitivity: 3,
    fov: 75,
    flashlightBrightness: 4.5,
    volume: 80,
  });

  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [tickets, setTickets] = useState(0);
  const [itemHeld, setItemHeld] = useState('None');
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);

  // Register subtitle listener
  useEffect(() => {
    registerSubtitleListener((text) => setSubtitle(text));
  }, []);

  // Play Title Music on click on Title Screen
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (currentScreen === 'main') {
        titleMusic.play();
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [currentScreen]);

  const handleUpdateKeybinding = useCallback((action: keyof Keybindings, newCode: string) => {
    setKeybindings((prev) => {
      const updated = {
        ...prev,
        [action]: { ...prev[action], code: newCode },
      };
      localStorage.setItem('gordon_scared_jeff_keybindings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleUpdateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleStartGame = () => {
    titleMusic.stop();
    setCurrentScreen('hud');
    setActiveMiniGame(null);

    // Initial Jeff speech
    setTimeout(() => {
      speakJeffLine('A-Alright, Jeff... find out what happened here... and get the hell out...', 'scared', 4500);
    }, 800);
  };

  const handleResumeGame = () => {
    setCurrentScreen('hud');
  };

  const handlePauseGame = () => {
    setCurrentScreen('pause');
  };

  const handleQuitToMain = () => {
    setCurrentScreen('main');
    setActiveMiniGame(null);
    titleMusic.play();
  };

  const handleNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2500);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030508] font-sans text-white select-none">
      {/* Horror Vignette */}
      <div className="absolute inset-0 pointer-events-none z-4 bg-[radial-gradient(circle,rgba(0,0,0,0)_35%,rgba(0,0,0,0.96)_100%)]" />

      {/* 3D WebGL Canvas */}
      <GameCanvas
        isPlaying={currentScreen === 'hud'}
        keybindings={keybindings}
        settings={settings}
        activeMiniGame={activeMiniGame}
        onPause={handlePauseGame}
        onOpenNote={() => setActiveMiniGame('NOTE')}
        onOpenBalloonPop={() => setActiveMiniGame('BALLOON_POP')}
        onUpdateTickets={(amount) => setTickets((t) => t + amount)}
        onPickupItem={(item) => setItemHeld(item)}
        onShowPrompt={setInteractionPrompt}
        onShowNotification={handleNotification}
      />

      {/* In-Game HUD */}
      {currentScreen === 'hud' && (
        <HUD
          tickets={tickets}
          itemHeld={itemHeld}
          interactionPrompt={interactionPrompt}
          subtitle={subtitle}
          notification={notification}
        />
      )}

      {/* Bloody Note Popup */}
      {activeMiniGame === 'NOTE' && (
        <BloodyNoteOverlay onClose={() => setActiveMiniGame(null)} />
      )}

      {/* Balloon Pop Minigame Overlay */}
      {activeMiniGame === 'BALLOON_POP' && (
        <BalloonPopMinigame
          onEarnTickets={(amt) => {
            setTickets((t) => t + amt);
            handleNotification(`💥 Popped Balloon! +${amt} Tickets`);
          }}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* Title Screen */}
      {currentScreen === 'main' && (
        <TitleScreen
          onPlay={handleStartGame}
          onOpenSettings={() => {
            setPreviousMenu('main');
            setCurrentScreen('settings');
          }}
          onOpenControls={() => {
            setPreviousMenu('main');
            setCurrentScreen('controls');
          }}
        />
      )}

      {/* Settings Menu */}
      {currentScreen === 'settings' && (
        <SettingsMenu
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setCurrentScreen(previousMenu)}
        />
      )}

      {/* Controls Menu */}
      {currentScreen === 'controls' && (
        <ControlsMenu
          keybindings={keybindings}
          onUpdateKeybinding={handleUpdateKeybinding}
          onBack={() => setCurrentScreen(previousMenu)}
        />
      )}

      {/* Pause Menu */}
      {currentScreen === 'pause' && (
        <PauseMenu
          onResume={handleResumeGame}
          onOpenSettings={() => {
            setPreviousMenu('pause');
            setCurrentScreen('settings');
          }}
          onOpenControls={() => {
            setPreviousMenu('pause');
            setCurrentScreen('controls');
          }}
          onQuitToMain={handleQuitToMain}
        />
      )}
    </div>
  );
}
