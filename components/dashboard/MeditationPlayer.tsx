// app/components/dashboard/MeditationPlayer.tsx
import React, { useEffect, useRef } from 'react';
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
    <div className="max-w-sm mx-auto">
      <div className="text-center text-xl font-semibold my-4">
        {isDashboard ? 'Play It Now' : 'Now Playing'}
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="text-center mt-4">
          <div className="text-sm text-gray-600">
            {isDashboard ? 'Generated Meditation' : meditationName}
          </div>
        </div>
        <div className="flex justify-center items-center space-x-4 mt-4">
          <audio ref={audioRef} controls />
        </div>
      </div>
      {isDashboard && (
        <div className="flex justify-center space-x-4 mt-6">
          <Button onClick={onSave}>Save to Library</Button>
          <Button onClick={onDiscard}>Discard</Button>
        </div>
      )}
    </div>
  );
};

export default MeditationPlayer;