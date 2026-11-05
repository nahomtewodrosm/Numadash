"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { gameAudio } from "@/lib/game/audio";

const SOUND_KEY = "numa-run:sound";
const SOUND_EVENT = "numa:sound-changed";

function readSoundOn(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_KEY) !== "off";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SOUND_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SOUND_EVENT, callback);
  };
}

export function useSoundSetting() {
  const soundOn = useSyncExternalStore(subscribe, readSoundOn, () => true);

  useEffect(() => {
    gameAudio.setMuted(!soundOn);
  }, [soundOn]);

  const toggleSound = useCallback(() => {
    const next = !readSoundOn();
    window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    gameAudio.setMuted(!next);
    if (next) gameAudio.unlock();
    window.dispatchEvent(new Event(SOUND_EVENT));
  }, []);

  return { soundOn, toggleSound };
}
