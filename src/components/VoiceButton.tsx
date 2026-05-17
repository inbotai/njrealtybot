"use client";

import { useState, useRef } from "react";
import { transcribeAudio } from "@/lib/api";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceButton({ onTranscript, className = "" }: VoiceButtonProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggle() {
    if (recording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((t) => t.stop());

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (audioBlob.size < 1000) return; // Too short

        setTranscribing(true);
        try {
          const text = await transcribeAudio(audioBlob);
          if (text.trim()) {
            onTranscript(text.trim());
          }
        } catch {
          // Fallback silently
        }
        setTranscribing(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone access and try again.");
    }
  }

  const isActive = recording || transcribing;

  return (
    <button
      onClick={toggle}
      type="button"
      disabled={transcribing}
      aria-label={recording ? "Stop recording" : transcribing ? "Transcribing..." : "Voice search"}
      className={`flex items-center justify-center transition ${
        recording
          ? "text-red-500 animate-pulse"
          : transcribing
            ? "text-amber-500 animate-pulse"
            : "text-gray-400 hover:text-indigo-600"
      } ${className}`}
    >
      {transcribing ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 animate-spin">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" opacity=".3" />
          <path d="M12 2a10 10 0 019.95 9h-2.02A8 8 0 0012 4V2z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      )}
    </button>
  );
}
