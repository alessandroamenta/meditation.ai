// app/components/dashboard/MeditationsListWrapper.tsx
'use client';
import { useState } from 'react';
import MeditationsList from '@/components/dashboard/MeditationsList';
import MeditationPlayer from '@/components/dashboard/MeditationPlayer';

const MeditationsListWrapper: React.FC = () => {
  const [currentMeditation, setCurrentMeditation] = useState<{
    id: string;
    signedUrl: string;
    display_name: string;
  } | null>(null);

  const handlePlayMeditation = (meditation: {
    id: string;
    signedUrl: string;
    display_name: string;
  }) => {
    setCurrentMeditation(meditation);
  };

  return (
    <div className="relative min-h-screen">
      <MeditationsList onPlayMeditation={handlePlayMeditation} />
      {currentMeditation && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-4 max-w-md mx-auto h-auto">
          <MeditationPlayer
            audioUrl={currentMeditation.signedUrl}
            meditationName={currentMeditation.display_name}
            isDashboard={false}
          />
        </div>
      )}
    </div>
  );
};

export default MeditationsListWrapper;

