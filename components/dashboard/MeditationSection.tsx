// app/(dashboard)/dashboard/MeditationSection.tsx
'use client';
import React, { useState } from 'react';
import MeditationSettingsForm from "@/components/dashboard/MeditationSettingsForm"
import MeditationPlayer from "@/components/dashboard/MeditationPlayer"

const MeditationSection: React.FC = () => {
  const [meditationId, setMeditationId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [hasNewAudio, setHasNewAudio] = useState(false);

  const handleMeditationGenerated = async (meditationId: string) => {
    setMeditationId(meditationId);
    const response = await fetch(`/api/supabase?meditationId=${meditationId}`);
    const data = await response.json();
    setAudioUrl(data.signedUrl);
    setHasNewAudio(true);
  };

  const handleSaveMeditation = async () => {
    // Save the meditation to the user's library (implement the logic as needed)
    setHasNewAudio(false);
  };

  const handleDiscardMeditation = async () => {
    await fetch(`/api/supabase?meditationId=${meditationId}`, { method: 'DELETE' });
    setHasNewAudio(false);
  };

  return (
    <>
      <MeditationSettingsForm onMeditationGenerated={handleMeditationGenerated} />
      {hasNewAudio && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-4 max-w-md mx-auto h-auto">
          <MeditationPlayer
            audioUrl={audioUrl}
            onSave={handleSaveMeditation}
            onDiscard={handleDiscardMeditation}
          />
        </div>
      )}
    </>
  );
};

export default MeditationSection;