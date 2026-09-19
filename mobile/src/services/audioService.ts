interface AudioStatusListener {
  (status: { isPlaying: boolean; positionSeconds: number; durationSeconds: number }): void;
}

class AudioServiceClass {
  private activeDriver: "expo-audio" | "none" = "none";
  private recordingInstance: any = null;
  private soundInstance: any = null;
  private statusInterval: any = null;

  constructor() {
    this.detectDriver();
  }

  private detectDriver() {
    try {
      const { requireOptionalNativeModule } = require("expo-modules-core");
      if (requireOptionalNativeModule("ExpoAudio") != null) {
        this.activeDriver = "expo-audio";
      } else {
        this.activeDriver = "none";
      }
    } catch {
      this.activeDriver = "none";
    }
  }

  public isSupported(): boolean {
    return this.activeDriver !== "none";
  }

  public getDriverName(): string {
    return this.activeDriver;
  }

  public async requestPermissions(): Promise<boolean> {
    if (this.activeDriver === "expo-audio") {
      try {
        const { requestRecordingPermissionsAsync } = require("expo-audio");
        const res = await requestRecordingPermissionsAsync();
        return Boolean(res?.granted);
      } catch {
        return false;
      }
    }
    return true;
  }

  public async startRecording(): Promise<void> {
    if (this.activeDriver === "expo-audio") {
      try {
        const { RecordingPresets, setAudioModeAsync } = require("expo-audio");
        const AudioModule = require("expo-audio").AudioModule;

        try {
          await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
        } catch {}

        const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
        await recorder.prepareToRecordAsync();
        recorder.record();
        this.recordingInstance = recorder;
        return;
      } catch (err) {
        console.warn("expo-audio recorder start error:", err);
      }
    }

    // Safe fallback recorder
    this.recordingInstance = {
      mock: true,
      startTime: Date.now(),
    };
  }

  public async pauseRecording(): Promise<void> {
    if (!this.recordingInstance) return;

    if (this.activeDriver === "expo-audio" && typeof this.recordingInstance.pause === "function") {
      this.recordingInstance.pause();
    }
  }

  public async resumeRecording(): Promise<void> {
    if (!this.recordingInstance) return;

    if (this.activeDriver === "expo-audio" && typeof this.recordingInstance.record === "function") {
      this.recordingInstance.record();
    }
  }

  public async stopRecording(): Promise<string | null> {
    if (!this.recordingInstance) return null;

    try {
      if (this.activeDriver === "expo-audio" && typeof this.recordingInstance.stop === "function") {
        await this.recordingInstance.stop();
        const uri = this.recordingInstance.uri;
        this.recordingInstance = null;
        return uri || null;
      } else {
        this.recordingInstance = null;
        return "data:audio/wav;base64,UklGRjAAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
      }
    } catch (err) {
      console.warn("Error stopping recording:", err);
      return null;
    }
  }

  public async playAudio(
    uri: string,
    onStatusUpdate?: AudioStatusListener
  ): Promise<void> {
    try {
      await this.stopAudio();

      if (this.activeDriver === "expo-audio") {
        try {
          const { createAudioPlayer } = require("expo-audio");
          const player = createAudioPlayer(uri);
          this.soundInstance = player;

          if (onStatusUpdate) {
            player.addListener("playbackStatusUpdate", (status: any) => {
              onStatusUpdate({
                isPlaying: Boolean(status?.playing),
                positionSeconds: Math.floor(status?.currentTime || 0),
                durationSeconds: Math.floor(status?.duration || 0),
              });
            });
          }
          player.play();
          return;
        } catch (err) {
          console.warn("expo-audio player error:", err);
        }
      }

      // Fallback simulation for playback
      let pos = 0;
      onStatusUpdate?.({ isPlaying: true, positionSeconds: 0, durationSeconds: 5 });
      this.statusInterval = setInterval(() => {
        pos += 1;
        if (pos > 5) {
          clearInterval(this.statusInterval);
          onStatusUpdate?.({ isPlaying: false, positionSeconds: 0, durationSeconds: 5 });
        } else {
          onStatusUpdate?.({ isPlaying: true, positionSeconds: pos, durationSeconds: 5 });
        }
      }, 1000);
    } catch (err) {
      console.warn("Audio playback error:", err);
    }
  }

  public async pauseAudio(): Promise<void> {
    if (this.statusInterval) clearInterval(this.statusInterval);

    if (this.activeDriver === "expo-audio" && this.soundInstance) {
      try {
        this.soundInstance.pause();
      } catch {}
    }
  }

  public async stopAudio(): Promise<void> {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }

    if (this.activeDriver === "expo-audio" && this.soundInstance) {
      try {
        this.soundInstance.pause();
        this.soundInstance.remove();
      } catch {}
      this.soundInstance = null;
    }
  }
}

export const AudioService = new AudioServiceClass();
