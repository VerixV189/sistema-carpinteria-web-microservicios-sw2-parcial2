import { Injectable } from '@angular/core';

export interface WhisperProgress {
  status: 'idle' | 'loading' | 'ready' | 'recording' | 'transcribing' | 'error';
  progressPct: number;
  message: string;
}

/**
 * Servicio de Reconocimiento de Voz 100% en el Navegador y Offline-First
 * usando OpenAI Whisper en formato ONNX (WebAssembly vía @xenova/transformers).
 *
 * - Funciona en TODOS los navegadores (Brave, Firefox, Chrome, Edge, Safari)
 *   porque captura PCM 16 kHz con el estándar Web Audio API (`getUserMedia` + `AudioContext`)
 *   sin depender de `webkitSpeechRecognition` de Google.
 * - Almacena los pesos cuantizados (`encoder_model_quantized.onnx` y `decoder_model_merged_quantized.onnx`)
 *   en el `CacheStorage` (`transformers-cache`) del navegador para operar 100% Offline
 *   igual que `sherpa_onnx` Whisper en la aplicación móvil Flutter.
 */
@Injectable({ providedIn: 'root' })
export class OfflineWhisperService {
  private static readonly SAMPLE_RATE = 16000;
  private static readonly MODEL_ID = 'Xenova/whisper-tiny';
  private static readonly TRANSFORMERS_CDN =
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

  private transcriber: any = null;
  private initPromise: Promise<void> | null = null;

  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private isRecordingFlag = false;

  status: WhisperProgress = {
    status: 'idle',
    progressPct: 0,
    message: 'Modelo Whisper ONNX listo para inicializar',
  };

  get isReady(): boolean {
    return this.transcriber !== null;
  }

  get isRecording(): boolean {
    return this.isRecordingFlag;
  }

  /**
   * Inicializa y cachea el modelo Whisper ONNX en el navegador (`CacheStorage`).
   */
  async initialize(onProgress?: (p: WhisperProgress) => void): Promise<void> {
    if (this.transcriber) {
      this.updateStatus(
        {
          status: 'ready',
          progressPct: 100,
          message: 'Whisper ONNX activo (100% Offline en Navegador)',
        },
        onProgress,
      );
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.updateStatus(
          {
            status: 'loading',
            progressPct: 5,
            message: 'Cargando motor ONNX WebAssembly para Whisper...',
          },
          onProgress,
        );

        // Importación dinámica ESM desde CDN (evita conflictos de empaquetado con Native Federation)
        const dynamicImport = new Function('url', 'return import(url)');
        const transformers = await dynamicImport(OfflineWhisperService.TRANSFORMERS_CDN);
        const { pipeline, env } = transformers;

        env.allowLocalModels = false;
        env.useBrowserCache = true;

        this.transcriber = await pipeline(
          'automatic-speech-recognition',
          OfflineWhisperService.MODEL_ID,
          {
            quantized: true,
            progress_callback: (data: any) => {
              if (data?.status === 'progress' && typeof data.progress === 'number') {
                const pct = Math.min(99, Math.max(10, Math.round(data.progress)));
                const fileName = data.file ? data.file.split('/').pop() : 'onnx';
                this.updateStatus(
                  {
                    status: 'loading',
                    progressPct: pct,
                    message: `Descargando/Cacheando Whisper ONNX (${fileName}): ${pct}%`,
                  },
                  onProgress,
                );
              } else if (data?.status === 'done') {
                this.updateStatus(
                  {
                    status: 'loading',
                    progressPct: 95,
                    message: 'Compilando grafo ONNX en WebAssembly...',
                  },
                  onProgress,
                );
              }
            },
          },
        );

        this.updateStatus(
          {
            status: 'ready',
            progressPct: 100,
            message: 'Whisper ONNX listo (Funciona en todos los navegadores y Offline)',
          },
          onProgress,
        );
      } catch (err) {
        this.initPromise = null;
        this.updateStatus(
          {
            status: 'error',
            progressPct: 0,
            message: `Error cargando Whisper ONNX: ${(err as Error).message}`,
          },
          onProgress,
        );
        throw err;
      }
    })();

    return this.initPromise;
  }

  /**
   * Inicia la grabación de audio PCM mono a 16 kHz desde el micrófono usando Web Audio API
   * (compatible con Brave, Firefox, Chrome, Edge y Safari).
   */
  async startRecording(
    onProgress?: (p: WhisperProgress) => void,
    onAudioLevel?: (levelPct: number) => void,
  ): Promise<void> {
    if (this.isRecordingFlag) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Tu navegador bloqueó el acceso a mediaDevices. Asegúrate de usar HTTPS o localhost.');
    }

    // Asegurar que el modelo Whisper ONNX esté inicializado (o iniciarlo antes de grabar)
    if (!this.transcriber) {
      await this.initialize(onProgress);
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: OfflineWhisperService.SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass({ sampleRate: OfflineWhisperService.SAMPLE_RATE });
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.pcmChunks = [];
    this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

    this.processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this.isRecordingFlag) return;
      const input = event.inputBuffer.getChannelData(0);
      const copy = new Float32Array(input.length);
      copy.set(input);
      this.pcmChunks.push(copy);

      if (onAudioLevel) {
        let sumSq = 0;
        for (let i = 0; i < copy.length; i++) {
          sumSq += copy[i] * copy[i];
        }
        const rms = Math.sqrt(sumSq / copy.length);
        const level = Math.min(100, Math.round(rms * 350));
        onAudioLevel(level);
      }
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioCtx.destination);
    this.isRecordingFlag = true;

    this.updateStatus(
      {
        status: 'recording',
        progressPct: 100,
        message: '🎙️ Grabando audio PCM 16 kHz... Habla ahora y presiona Detener al terminar.',
      },
      onProgress,
    );
  }

  /**
   * Detiene la captura del micrófono, une las muestras PCM Float32 y ejecuta
   * la inferencia local con Whisper ONNX en español.
   */
  async stopAndTranscribe(onProgress?: (p: WhisperProgress) => void): Promise<string> {
    if (!this.isRecordingFlag) return '';
    this.isRecordingFlag = false;

    const recordedSampleRate = this.audioCtx?.sampleRate || OfflineWhisperService.SAMPLE_RATE;
    this.cleanupAudioNodes();

    const totalLen = this.pcmChunks.reduce((acc, c) => acc + c.length, 0);
    if (totalLen < recordedSampleRate * 0.4) {
      this.updateStatus(
        {
          status: 'ready',
          progressPct: 100,
          message: 'Grabación muy corta (< 0.4s). Intenta hablar durante al menos 1 segundo.',
        },
        onProgress,
      );
      return '';
    }

    const merged = new Float32Array(totalLen);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    this.pcmChunks = [];

    // Si el navegador no respetó 16000 Hz en AudioContext, remuestreamos linealmente a 16000 Hz
    const samples16k =
      recordedSampleRate === OfflineWhisperService.SAMPLE_RATE
        ? merged
        : this.resampleLinear(merged, recordedSampleRate, OfflineWhisperService.SAMPLE_RATE);

    this.updateStatus(
      {
        status: 'transcribing',
        progressPct: 100,
        message: '🧠 Transcribiendo voz localmente con Whisper ONNX (Offline)...',
      },
      onProgress,
    );

    try {
      if (!this.transcriber) {
        await this.initialize(onProgress);
      }

      const result = await this.transcriber(samples16k, {
        language: 'spanish',
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
      });

      const rawText = (typeof result === 'string' ? result : result?.text ?? '').trim();
      const cleaned = this.normalizeSpanishTranscript(rawText);

      this.updateStatus(
        {
          status: 'ready',
          progressPct: 100,
          message: cleaned
            ? `✅ Transcripción Whisper ONNX completada: "${cleaned}"`
            : 'No se detectaron palabras claras en la grabación.',
        },
        onProgress,
      );

      return cleaned;
    } catch (err) {
      this.updateStatus(
        {
          status: 'error',
          progressPct: 0,
          message: `Error al transcribir con Whisper ONNX: ${(err as Error).message}`,
        },
        onProgress,
      );
      throw err;
    }
  }

  cancelRecording(): void {
    this.isRecordingFlag = false;
    this.pcmChunks = [];
    this.cleanupAudioNodes();
  }

  private cleanupAudioNodes(): void {
    try {
      this.processorNode?.disconnect();
      this.sourceNode?.disconnect();
    } catch {
      // ignore
    }
    this.processorNode = null;
    this.sourceNode = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  private resampleLinear(input: Float32Array, fromRate: number, toRate: number): Float32Array {
    if (fromRate === toRate) return input;
    const ratio = fromRate / toRate;
    const newLength = Math.round(input.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const pos = i * ratio;
      const idx = Math.floor(pos);
      const frac = pos - idx;
      const next = idx + 1 < input.length ? input[idx + 1] : input[idx];
      result[i] = input[idx] * (1 - frac) + next * frac;
    }
    return result;
  }

  private normalizeSpanishTranscript(text: string): string {
    // Limpiar artefactos comunes de Whisper en silencios (ej. "[Música]", "( aplausos )", etc.)
    return text
      .replace(/\[.*?\]|\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private updateStatus(next: WhisperProgress, cb?: (p: WhisperProgress) => void): void {
    this.status = next;
    if (cb) cb(next);
  }
}
