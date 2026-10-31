import { Point2D, SonificationOptions } from '../types';

export class SonifierEngine {
  private ctx: AudioContext | null = null;
  private currentOscillator: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private currentPanner: StereoPannerNode | null = null;
  private isPlaying: boolean = false;
  private sweepTimer: number | null = null;
  private animationFrameId: number | null = null;

  public defaultOptions: SonificationOptions = {
    sweepDuration: 3.5,
    minFrequency: 220, // A3
    maxFrequency: 880, // A5
    stereoPanning: true,
    playEarcons: true,
    harmonicTimbre: true,
    volume: 0.7
  };

  /**
   * Lazily initialize AudioContext on user gesture.
   */
  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Map y value to audible frequency (Hz)
   */
  public mapYToFrequency(y: number, yMin: number, yMax: number, minFreq: number, maxFreq: number): number {
    if (isNaN(y) || yMax === yMin) return (minFreq + maxFreq) / 2;
    // Normalized 0 to 1
    const clampedY = Math.max(yMin, Math.min(yMax, y));
    const norm = (clampedY - yMin) / (yMax - yMin);
    // Exponential pitch curve for natural human auditory perception
    return minFreq * Math.pow(maxFreq / minFreq, norm);
  }

  /**
   * Map x value to stereo pan (-1.0 to 1.0)
   */
  public mapXToPan(x: number, xMin: number, xMax: number): number {
    if (xMax === xMin) return 0;
    const norm = (x - xMin) / (xMax - xMin);
    return Math.max(-1.0, Math.min(1.0, -1.0 + norm * 2.0));
  }

  /**
   * Play an earcon (subtle sound cue) for a critical feature.
   */
  public async playEarcon(type: 'root' | 'extrema' | 'axis' | 'asymptote'): Promise<void> {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'root') {
      // Crisp bell chime for zero crossing
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1174.66, now); // D6
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'extrema') {
      // Harmonic pip for peak/valley
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'axis') {
      // Soft woodblock tick for Y-axis (x = 0)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'asymptote') {
      // Low buzz for undefined/asymptote
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  }

  /**
   * Play a discrete single point sound (used during keyboard scrubbing).
   */
  public async playDiscretePoint(
    point: Point2D,
    yMin: number,
    yMax: number,
    xMin: number,
    xMax: number,
    options: SonificationOptions = this.defaultOptions
  ): Promise<void> {
    const ctx = await this.ensureContext();
    this.stopSweep();

    if (point.isDiscontinuity || isNaN(point.y)) {
      if (options.playEarcons) {
        this.playEarcon('asymptote');
      }
      return;
    }

    const freq = this.mapYToFrequency(point.y, yMin, yMax, options.minFrequency, options.maxFrequency);
    const pan = options.stereoPanning ? this.mapXToPan(point.x, xMin, xMax) : 0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use sawtooth/triangle for negative values to distinguish sign
    osc.type = options.harmonicTimbre && point.y < 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(options.volume * 0.45, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    if (ctx.createStereoPanner && options.stereoPanning) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, ctx.currentTime);
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);

    // Play earcons and trigger haptic pulse if critical point
    if (options.playEarcons) {
      if (point.isRoot) {
        this.playEarcon('root');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
      } else if (point.isLocalMax || point.isLocalMin) {
        this.playEarcon('extrema');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 20, 30]);
        }
      } else if (point.isYIntercept) {
        this.playEarcon('axis');
      }
    }
  }

  /**
   * Play continuous sonification sweep across all points in the curve.
   */
  public async playContinuousSweep(
    points: Point2D[],
    yMin: number,
    yMax: number,
    xMin: number,
    xMax: number,
    options: SonificationOptions = this.defaultOptions,
    onProgress?: (index: number, point: Point2D) => void,
    onComplete?: () => void
  ): Promise<void> {
    const ctx = await this.ensureContext();
    this.stopSweep();

    if (!points || points.length === 0) return;

    this.isPlaying = true;
    const duration = Math.max(1.0, options.sweepDuration);
    const startTime = ctx.currentTime;
    const endTime = startTime + duration;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    let panner: StereoPannerNode | null = null;

    osc.type = 'sine';

    if (ctx.createStereoPanner && options.stereoPanning) {
      panner = ctx.createStereoPanner();
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(options.volume * 0.4, startTime + 0.05);

    // Schedule frequency and pan across points
    const validPoints = points.filter(p => !p.isDiscontinuity && !isNaN(p.y));
    if (validPoints.length === 0) return;

    for (let i = 0; i < validPoints.length; i++) {
      const pt = validPoints[i];
      const pointTime = startTime + (i / (validPoints.length - 1)) * duration;
      const freq = this.mapYToFrequency(pt.y, yMin, yMax, options.minFrequency, options.maxFrequency);
      osc.frequency.setValueAtTime(freq, pointTime);

      if (panner && options.stereoPanning) {
        const panVal = this.mapXToPan(pt.x, xMin, xMax);
        panner.pan.setValueAtTime(panVal, pointTime);
      }

      // Schedule earcons along timeline
      if (options.playEarcons) {
        if (pt.isRoot) {
          setTimeout(() => this.playEarcon('root'), (pointTime - startTime) * 1000);
        } else if (pt.isLocalMax || pt.isLocalMin) {
          setTimeout(() => this.playEarcon('extrema'), (pointTime - startTime) * 1000);
        } else if (pt.isYIntercept) {
          setTimeout(() => this.playEarcon('axis'), (pointTime - startTime) * 1000);
        }
      }
    }

    // Fade out smoothly at end
    gain.gain.setValueAtTime(options.volume * 0.4, endTime - 0.05);
    gain.gain.linearRampToValueAtTime(0.001, endTime);

    osc.start(startTime);
    osc.stop(endTime);

    this.currentOscillator = osc;
    this.currentGain = gain;
    this.currentPanner = panner;

    // Visual synchronization loop
    const syncLoop = () => {
      if (!this.isPlaying) return;
      const elapsed = ctx.currentTime - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const currentIndex = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));

      if (onProgress && points[currentIndex]) {
        onProgress(currentIndex, points[currentIndex]);
      }

      if (progress < 1.0) {
        this.animationFrameId = requestAnimationFrame(syncLoop);
      } else {
        this.isPlaying = false;
        if (onComplete) onComplete();
      }
    };

    this.animationFrameId = requestAnimationFrame(syncLoop);

    this.sweepTimer = window.setTimeout(() => {
      this.isPlaying = false;
      if (onComplete) onComplete();
    }, duration * 1000 + 50);
  }

  /**
   * Stop active audio sweep and reset nodes.
   */
  public stopSweep(): void {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sweepTimer) {
      clearTimeout(this.sweepTimer);
      this.sweepTimer = null;
    }
    if (this.currentGain && this.ctx) {
      try {
        this.currentGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {
        // ignore
      }
    }
    if (this.currentOscillator) {
      try {
        this.currentOscillator.stop();
        this.currentOscillator.disconnect();
      } catch {
        // ignore
      }
      this.currentOscillator = null;
    }
    if (this.currentPanner) {
      try {
        this.currentPanner.disconnect();
      } catch {
        // ignore
      }
      this.currentPanner = null;
    }
    this.currentGain = null;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const sonifier = new SonifierEngine();
