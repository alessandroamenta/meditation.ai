// app/components/dashboard/MeditationPlayer.tsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MeditationPlayerProps {
  audioUrl: string;
  onSave?: () => void;
  onDiscard?: () => void;
  meditationName?: string;
  isDashboard?: boolean;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  audioUrl,
  onSave,
  onDiscard,
  meditationName,
  isDashboard = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
    }
  }, [audioUrl]);

  return (
    <div className="mx-auto max-w-sm">
      <div className="my-4 text-center text-xl font-semibold">
        {isDashboard ? "Play It Now" : "Now Playing"}
      </div>
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            {isDashboard ? "Generated Meditation" : meditationName}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-4">
          <audio ref={audioRef} controls />
        </div>
      </div>
      {isDashboard && (
        <div className="mt-6 flex justify-center space-x-4">
          <Button onClick={onSave}>Save to Library</Button>
          <Button onClick={onDiscard}>Discard</Button>
        </div>
      )}
    </div>
  );
};

export default MeditationPlayer;
