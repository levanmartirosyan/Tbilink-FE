import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioNotificationService {
  private isMuted = false;

  constructor() {
    this.isMuted = this.loadMutePreference();
  }

  /**
   * Play notification sound
   */
  playNotificationSound(): void {
    console.log('>>> playNotificationSound called, isMuted:', this.isMuted);

    if (this.isMuted) {
      console.log('Notification sound is muted');
      return;
    }

    // Create a new audio element each time to avoid caching/state issues
    const audio = new Audio();
    audio.src = 'assets/sounds/new-notification-3-398649.mp3';
    audio.volume = 0.5;

    audio
      .play()
      .then(() => {
        console.log('>>> Notification sound played successfully!');
      })
      .catch((error) => {
        console.warn('>>> Failed to play audio:', error);
        // Fallback to Web Audio API beep
        this.playBeep();
      });
  }

  /**
   * Simple beep using Web Audio API as fallback
   */
  private playBeep(): void {
    try {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);

      console.log('>>> Beep played via Web Audio API');
    } catch (error) {
      console.warn('>>> Failed to play beep:', error);
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.saveMutePreference();
    console.log(`Notification sounds ${this.isMuted ? 'muted' : 'enabled'}`);
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.saveMutePreference();
  }

  /**
   * Get current mute state
   */
  isSoundMuted(): boolean {
    return this.isMuted;
  }

  private saveMutePreference(): void {
    try {
      localStorage.setItem('notification-sound-muted', String(this.isMuted));
    } catch (e) {
      // Ignore
    }
  }

  private loadMutePreference(): boolean {
    try {
      return localStorage.getItem('notification-sound-muted') === 'true';
    } catch (e) {
      return false;
    }
  }
}
