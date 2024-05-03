// app/components/dashboard/MeditationSettingsForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Oval } from "react-loader-spinner";
import { OutOfCreditsModal } from "@/components/layout/outofcredits-modal";
import { dispatchCreditsUpdatedEvent } from "@/lib/events";

const aiProviderOptions = ["openai", "anthropic"];
const durationOptions = ["2-5min", "5-10min", "10+min"];
const guidanceOptions = ["low", "medium", "high"];
const ttsProviderOptions = ["openai", "elevenlabs"];
const voiceOptions: Record<string, { label: string; value: string }[]> = {
  openai: [
    { label: "Alloy", value: "alloy" },
    { label: "Echo", value: "echo" },
    { label: "Fable", value: "fable" },
    { label: "Onyx", value: "onyx" },
    { label: "Nova", value: "nova" },
    { label: "Shimmer", value: "shimmer" },
  ],
  elevenlabs: [
    { label: "Vincent", value: "Qe9WSybioZxssVEwlBSo" },
    { label: "Joanne", value: "RrkF2QZOPA1PyW4EamJj" },
    { label: "Stella", value: "h9wTb50iJC9oQuw5A37H" },
    { label: "Javier", value: "h415g7h7bSwQrn1qw4ar" },
    { label: "Gemma", value: "fqQpqTuOIBHOwbVaVZP3" },
    { label: "Tim", value: "XPzm47Wm41jCR5gentJy" },
  ],
};

interface MeditationSettings {
  aiProvider: string;
  duration: string;
  guidanceLevel: string;
  ttsProvider: string;
  voice: string;
  meditationFocus: string;
}

interface MeditationSettingsFormProps {
  onMeditationGenerated: (id: string) => void;
}

const MeditationSettingsForm: React.FC<MeditationSettingsFormProps> = ({
  onMeditationGenerated,
}) => {
  const [formData, setFormData] = useState<MeditationSettings>({
    aiProvider: "openai",
    duration: "2-5min",
    guidanceLevel: "low",
    ttsProvider: "openai",
    voice: "alloy",
    meditationFocus: "mindfulness and breath control",
  });
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [playingVoiceSample, setPlayingVoiceSample] =
    useState<HTMLAudioElement | null>(null);
  const [voiceSampleUrls, setVoiceSampleUrls] = useState<
    Record<string, { voiceId: string; url: string }[]>
  >({
    openai: [],
    elevenlabs: [],
  });
  const [preloadedAudio, setPreloadedAudio] = useState<
    Record<string, HTMLAudioElement>
  >({});
  const [isOutOfCredits, setIsOutOfCredits] = useState(false);

  useEffect(() => {
    const fetchVoiceSampleUrls = async () => {
      try {
        const response = await fetch("/api/voice-samples-urls");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVoiceSampleUrls(data);
      } catch (error) {
        console.error("Error fetching voice sample URLs:", error);
      }
    };

    fetchVoiceSampleUrls();
  }, []);

  useEffect(() => {
    const preloadAudio = async () => {
      const audioElements: Record<string, HTMLAudioElement> = {};

      for (const provider in voiceSampleUrls) {
        for (const sample of voiceSampleUrls[provider]) {
          const audio = new Audio(sample.url);
          audioElements[`${provider}-${sample.voiceId}`] = audio;
        }
      }

      setPreloadedAudio(audioElements);
    };

    preloadAudio();
  }, [voiceSampleUrls]);

  const handleToggleChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    console.log("Sending form data:", formData);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.error ===
          "You have reached your monthly meditation generation limit. Please upgrade your subscription or wait until next month."
        ) {
          setIsOutOfCredits(true);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const result = await response.json();
        console.log("Received API response:", result);
        dispatchCreditsUpdatedEvent();
        const meditationId = result.meditationId;
        setAudioUrl(audioUrl);
        onMeditationGenerated(meditationId);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setErrorMessage("Failed to generate meditation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoiceSample = (voiceId: string, ttsProvider: string) => {
    const audioKey = `${ttsProvider}-${voiceId}`;
    const audio = preloadedAudio[audioKey];

    if (audio) {
      if (playingVoiceSample) {
        playingVoiceSample.pause();
      }

      audio.play();
      setPlayingVoiceSample(audio);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-gray-200 p-6 dark:border-gray-800"
      >
        <div className="flex items-center gap-4">
          <Label htmlFor="ai-provider">🤖 AI Model</Label>
          <div className="grid grid-cols-2 gap-4">
            {aiProviderOptions.map((option) => (
              <Toggle
                key={option}
                size="sm"
                variant="outline"
                pressed={formData.aiProvider === option}
                onPressedChange={() => handleToggleChange("aiProvider", option)}
              >
                {option}
              </Toggle>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="duration">⏳ Meditation Length</Label>
          <div className="grid grid-cols-3 gap-4">
            {durationOptions.map((option) => (
              <Toggle
                key={option}
                size="sm"
                variant="outline"
                pressed={formData.duration === option}
                onPressedChange={() => handleToggleChange("duration", option)}
              >
                {option}
              </Toggle>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="meditation-focus">💆‍♂️ Meditation Focus</Label>
          <select
            id="meditation-focus"
            value={formData.meditationFocus}
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                meditationFocus: e.target.value,
              }))
            }
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mindfulness and breath control">
              Mindfulness and Breath Control
            </option>
            <option value="loving-kindness and compassion">
              Loving-kindness and Compassion
            </option>
            <option value="body scan and relaxation">
              Body Scan and Relaxation
            </option>
            <option value="visualization and inner journey">
              Visualization and Inner Journey
            </option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="guidance-level">🧘‍♀️ Guidance Amount</Label>
          <div className="grid grid-cols-3 gap-4">
            {guidanceOptions.map((option) => (
              <Toggle
                key={option}
                size="sm"
                variant="outline"
                pressed={formData.guidanceLevel === option}
                onPressedChange={() =>
                  handleToggleChange("guidanceLevel", option)
                }
              >
                {option}
              </Toggle>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="tts-provider">🎙️ Voice Provider</Label>
          <div className="grid grid-cols-2 gap-4">
            {ttsProviderOptions.map((option) => (
              <Toggle
                key={option}
                size="sm"
                variant="outline"
                pressed={formData.ttsProvider === option}
                onPressedChange={() =>
                  handleToggleChange("ttsProvider", option)
                }
              >
                {option}
              </Toggle>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="voice">🗣️ Voice Selection</Label>
          <div className="grid grid-cols-3 gap-4">
            {voiceOptions[formData.ttsProvider].map((option) => (
              <div key={option.value} className="flex items-center">
                <Toggle
                  size="sm"
                  variant="outline"
                  pressed={formData.voice === option.value}
                  onPressedChange={() =>
                    handleToggleChange("voice", option.value)
                  }
                >
                  {option.label}
                </Toggle>
                <button
                  type="button"
                  onClick={() =>
                    handlePlayVoiceSample(option.label, formData.ttsProvider)
                  }
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Oval
                height={20}
                width={20}
                color="#ffffff"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                ariaLabel="oval-loading"
                secondaryColor="#cccccc"
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
              <span className="ml-2">
                Creating your meditation...just a few secs, breath and relax🧘‍♀️✨
              </span>
            </div>
          ) : (
            "Generate Meditation"
          )}
        </Button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
      <OutOfCreditsModal
        isOpen={isOutOfCredits}
        onClose={() => setIsOutOfCredits(false)}
      />
    </>
  );
};

export default MeditationSettingsForm;
