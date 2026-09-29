/**
 * Haptic Vibration Feedback for mobile devices (HTML5 Vibration API)
 */

class HapticFeedback {
  public enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('cartasrc_haptics');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('cartasrc_haptics', String(this.enabled));
    } catch {}
    if (this.enabled) {
      this.light();
    }
    return this.enabled;
  }

  private canVibrate(): boolean {
    return this.enabled && typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  public light() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(12);
    } catch {}
  }

  public point() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(22);
    } catch {}
  }

  public stone() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(30);
    } catch {}
  }

  public undo() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([15, 30, 20]);
    } catch {}
  }

  public victory() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([40, 50, 40, 50, 100]);
    } catch {}
  }
}

export const haptics = new HapticFeedback();
