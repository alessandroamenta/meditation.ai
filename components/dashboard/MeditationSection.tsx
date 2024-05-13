// app/(dashboard)/dashboard/MeditationSection.tsx
"use client";
import React, { useState } from "react";
import MeditationSettingsForm from "@/components/dashboard/MeditationSettingsForm";
import MeditationPlayer from "@/components/dashboard/MeditationPlayer";

const MeditationSection: React.FC = () => {
  const [meditationId, setMeditationId] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
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
    await fetch(`/api/supabase?meditationId=${meditationId}`, {
      method: "DELETE",
    });
    setHasNewAudio(false);
  };

  return (
    <>
      <MeditationSettingsForm
        onMeditationGenerated={handleMeditationGenerated}
      />
      {hasNewAudio && (
        <div className="fixed bottom-0 left-1/2 mx-auto h-auto max-w-md -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
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
