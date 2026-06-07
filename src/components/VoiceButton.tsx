"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { transcribeAudio } from "@/lib/api";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  /** Called when recording state changes — parent can hide input */
  onRecordingChange?: (isRecording: boolean) => void;
}

export default function VoiceButton({ onTranscript, className = "", onRecordingChange }: VoiceButtonProps) {
  const [state, setState] = useState<"idle" | "recording" | "paused" | "transcribing">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const pausedElapsedRef = useRef(0);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const destroyStream = useCallback(() => {
    cleanup();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => () => destroyStream(), [destroyStream]);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus" : "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Audio analysis for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setState("recording");
      setElapsed(0);
      setWaveform([]);
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = 0;
      onRecordingChange?.(true);

      // Timer
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000) + pausedElapsedRef.current);
      }, 200);

      // Waveform capture
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function captureWave() {
        if (mediaRecorder.state !== "recording") return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        // Normalize to 0-1 range, min height 0.08
        const level = Math.max(0.08, Math.min(1, avg / 80));
        setWaveform(prev => {
          const next = [...prev, level];
          // Keep last 60 bars
          return next.length > 60 ? next.slice(-60) : next;
        });
        rafRef.current = requestAnimationFrame(captureWave);
      }
      captureWave();

      // Hard max: 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") sendRecording();
      }, 60000);

    } catch {
      alert("Microphone access denied. Please allow microphone access and try again.");
    }
  }

  function pauseRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      pausedElapsedRef.current = elapsed;
      setState("paused");
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      setState("recording");

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000) + pausedElapsedRef.current);
      }, 200);

      const analyser = analyserRef.current;
      if (analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        function captureWave() {
          if (mediaRecorderRef.current?.state !== "recording") return;
          analyser!.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const level = Math.max(0.08, Math.min(1, avg / 80));
          setWaveform(prev => {
            const next = [...prev, level];
            return next.length > 60 ? next.slice(-60) : next;
          });
          rafRef.current = requestAnimationFrame(captureWave);
        }
        captureWave();
      }
    }
  }

  function discardRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }
    destroyStream();
    setState("idle");
    setElapsed(0);
    setWaveform([]);
    onRecordingChange?.(false);
  }

  function sendRecording() {
    if (!mediaRecorderRef.current) return;

    const recorder = mediaRecorderRef.current;
    recorder.onstop = async () => {
      destroyStream();
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      if (audioBlob.size < 1000) {
        setState("idle");
        return;
      }

      setState("transcribing");
      onRecordingChange?.(false);
      try {
        const text = await transcribeAudio(audioBlob);
        if (text.trim()) onTranscript(text.trim());
      } catch { /* silent */ }
      setState("idle");
      setElapsed(0);
      setWaveform([]);
    };

    if (recorder.state !== "inactive") recorder.stop();
  }

  // ── Idle: just the mic icon ──
  if (state === "idle") {
    return (
      <button
        onClick={startRecording}
        type="button"
        aria-label="Voice search"
        className={`flex items-center justify-center text-gray-400 hover:text-indigo-600 transition ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    );
  }

  // ── Transcribing: spinner ──
  if (state === "transcribing") {
    return (
      <div className={`flex items-center justify-center text-amber-500 animate-pulse ${className}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 animate-spin">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" opacity=".3" />
          <path d="M12 2a10 10 0 019.95 9h-2.02A8 8 0 0012 4V2z" />
        </svg>
      </div>
    );
  }

  // ── Recording / Paused: WhatsApp-style bar ──
  return (
    <div className="flex items-center gap-2 w-full">
      {/* Trash / discard */}
      <button
        onClick={discardRecording}
        type="button"
        aria-label="Discard recording"
        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z" />
        </svg>
      </button>

      {/* Recording bar */}
      <div className="flex flex-1 items-center gap-2 rounded-full bg-gray-100 px-3 py-2 min-w-0">
        {/* Red dot */}
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${state === "recording" ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />

        {/* Timer */}
        <span className="text-xs font-mono text-gray-600 flex-shrink-0 w-8">{formatTime(elapsed)}</span>

        {/* Waveform */}
        <div className="flex flex-1 items-center gap-px h-6 overflow-hidden">
          {waveform.map((level, i) => (
            <div
              key={i}
              className={`w-[2px] flex-shrink-0 rounded-full ${state === "recording" ? "bg-gray-600" : "bg-gray-400"}`}
              style={{ height: `${Math.round(level * 100)}%`, minHeight: "2px" }}
            />
          ))}
          {/* Fill empty space */}
          {waveform.length < 60 && (
            <div className="flex-1 flex items-center gap-px h-6">
              {Array.from({ length: Math.max(0, 60 - waveform.length) }).map((_, i) => (
                <div key={`e${i}`} className="w-[2px] flex-shrink-0 rounded-full bg-gray-300" style={{ height: "2px" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pause / Resume */}
      <button
        onClick={state === "recording" ? pauseRecording : resumeRecording}
        type="button"
        aria-label={state === "recording" ? "Pause" : "Resume"}
        className="flex-shrink-0 p-1.5 text-gray-600 hover:text-gray-900 transition"
      >
        {state === "recording" ? (
          // Pause icon
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          // Resume / play icon
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Send */}
      <button
        onClick={sendRecording}
        type="button"
        aria-label="Send voice message"
        className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
