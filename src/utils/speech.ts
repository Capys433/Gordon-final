// Jeff's Terrified Voice & Subtitle System

type Emotion = 'nervous' | 'scared' | 'terrified';

type SubtitleCallback = (text: string | null) => void;

let subtitleListener: SubtitleCallback | null = null;
let subtitleTimer: number | null = null;

export function registerSubtitleListener(callback: SubtitleCallback) {
  subtitleListener = callback;
}

export function speakJeffLine(text: string, emotion: Emotion = 'scared', durationMs: number = 4500) {
  if (subtitleListener) {
    subtitleListener(text);
  }

  // Voice Synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    // Clean hyphens for smoother TTS speech
    const cleanText = text.replace(/-/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Adjust pitch and rate based on panic/emotion level
    if (emotion === 'terrified') {
      utterance.pitch = 1.25; // High-pitched, breathless terror
      utterance.rate = 0.88;  // Trembling speed
    } else if (emotion === 'nervous') {
      utterance.pitch = 0.95;
      utterance.rate = 0.95;
    } else { // scared
      utterance.pitch = 1.08;
      utterance.rate = 0.92;
    }

    // Prefer male english voice if available
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural')));
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  if (subtitleTimer) {
    window.clearTimeout(subtitleTimer);
  }

  subtitleTimer = window.setTimeout(() => {
    if (subtitleListener) {
      subtitleListener(null);
    }
  }, durationMs);
}
