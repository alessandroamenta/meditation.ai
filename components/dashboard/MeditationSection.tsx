// app/(dashboard)/dashboard/MeditationSection.tsx
'use client';
import React, { useState } from 'react';
import MeditationSettingsForm from "@/components/dashboard/MeditationSettingsForm"
import MeditationPlayer from "@/components/dashboard/MeditationPlayer"

const MeditationSection: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState('');
  const [hasNewAudio, setHasNewAudio] = useState(false);

  const handleAudioUrlChange = (url: string) => {
    setAudioUrl(url);
    setHasNewAudio(true);
  };

  return (
    <>
      <MeditationSettingsForm onAudioUrlChange={handleAudioUrlChange} />
      {hasNewAudio && <MeditationPlayer audioUrl={audioUrl} />}
    </>
  );
};

export default MeditationSection;