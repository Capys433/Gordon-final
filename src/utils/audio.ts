// Web Audio & Synth Manager for "Du bist gut genug" title screen track
class TitleMusicManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private synthInterval: number | null = null;
  private htmlAudio: HTMLAudioElement | null = null;

  constructor() {
    // Primary HTML Audio with fallback
    this.htmlAudio = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3');
    this.htmlAudio.loop = true;
    this.htmlAudio.volume = 0.5;
  }

  public play() {
    this.isPlaying = true;
    this.isMuted = false;

    // Try HTML audio first
    if (this.htmlAudio) {
      this.htmlAudio.volume = 0.5;
      this.htmlAudio.play().catch(() => {
        // Fallback to Web Audio Synthesizer if browser blocks external MP3
        this.playSynthesizedTrack();
      });
    } else {
      this.playSynthesizedTrack();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.htmlAudio) {
      this.htmlAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  private playSynthesizedTrack() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // German upbeat melody synth for "Du bist gut genug"
    const notes = [
      261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, // C4 to C5
      392.00, 329.63, 392.00, 523.25, 440.00, 392.00, 349.23, 329.63
    ];
    let noteIdx = 0;

    if (this.synthInterval) window.clearInterval(this.synthInterval);

    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying || this.isMuted || !this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteIdx % notes.length], this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);

      noteIdx++;
    }, 280);
  }
}

export const titleMusic = new TitleMusicManager();
