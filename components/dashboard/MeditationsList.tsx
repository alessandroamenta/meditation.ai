import { useEffect, useState } from "react";

interface Meditation {
  id: string;
  audio_path: string;
  display_name: string;
  duration: string;
  signedUrl: string;
}

interface MeditationsListProps {
  onPlayMeditation: (meditation: {
    id: string;
    signedUrl: string;
    display_name: string;
  }) => void;
}

const MeditationsList: React.FC<MeditationsListProps> = ({
  onPlayMeditation,
}) => {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [editingMeditationId, setEditingMeditationId] = useState<string | null>(
    null,
  );
  const [editedMeditationName, setEditedMeditationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMeditations();
  }, []);

  const fetchMeditations = () => {
    setIsLoading(true);
    fetch("/api/get-all-meditations")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMeditations(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch meditations");
        console.error("Error fetching meditations:", error);
        setIsLoading(false);
      });
  };

  const fetchMeditationAudio = async (meditationId: string) => {
    try {
      const response = await fetch(
        `/api/get-meditation-audio?meditationId=${meditationId}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error("Error fetching meditation audio:", error);
      setError("Failed to fetch meditation audio");
      return null;
    }
  };

  const handlePlayMeditation = async (meditation: Meditation) => {
    const signedUrl = await fetchMeditationAudio(meditation.id);
    if (signedUrl) {
      onPlayMeditation({
        id: meditation.id,
        signedUrl,
        display_name: meditation.display_name,
      });
    }
  };

  const deleteMeditation = async (meditationId: string) => {
    try {
      const response = await fetch(
        `/api/supabase?meditationId=${meditationId}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        setMeditations((prevMeditations) =>
          prevMeditations.filter(
            (meditation) => meditation.id !== meditationId,
          ),
        );
        setCurrentMeditation(null);
      } else {
        setError("Failed to delete meditation");
      }
    } catch (error) {
      console.error("Error deleting meditation:", error);
      setError("Failed to delete meditation");
    }
  };

  const handleRenameMeditation = async () => {
    if (editingMeditationId && editedMeditationName) {
      try {
        const response = await fetch(
          `/api/supabase?meditationId=${editingMeditationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newName: editedMeditationName }),
          },
        );
        if (response.ok) {
          setMeditations((prevMeditations) =>
            prevMeditations.map((meditation) =>
              meditation.id === editingMeditationId
                ? { ...meditation, display_name: editedMeditationName }
                : meditation,
            ),
          );
          setEditingMeditationId(null);
          setEditedMeditationName("");
        } else {
          setError("Failed to rename meditation");
        }
      } catch (error) {
        console.error("Error renaming meditation:", error);
        setError("Failed to rename meditation");
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-1 items-center gap-4">
          <h1 className="text-2xl font-bold">Meditation</h1>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        {isLoading ? (
          <div className="text-center">
            <p className="text-lg">Loading meditations... 🧘‍♀️</p>
          </div>
        ) : meditations.length === 0 ? (
          <div className="text-center">
            <p className="text-lg">
              You haven&apos;t generated any meditations yet. 😌🌿
            </p>
            <p className="text-lg">
              Head over to the dashboard, create your first meditation, and
              chill out. 🎧💆‍♂️
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {meditations.map((meditation) => (
              <div
                key={meditation.id}
                className="grid grid-cols-1 items-center gap-4 rounded-lg border p-4 transition-all hover:bg-gray-100/40 dark:hover:bg-gray-800/40 md:grid-cols-6"
              >
                <div className="col-span-5 flex items-center gap-2">
                  <PlayIcon
                    className="size-6 cursor-pointer text-gray-500 dark:text-gray-400"
                    onClick={() => handlePlayMeditation(meditation)}
                  />
                  <div className="grid grid-cols-1 gap-1">
                    {editingMeditationId === meditation.id ? (
                      <input
                        type="text"
                        value={editedMeditationName}
                        onChange={(e) =>
                          setEditedMeditationName(e.target.value)
                        }
                        onBlur={handleRenameMeditation}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameMeditation();
                          } else if (e.key === "Escape") {
                            setEditingMeditationId(null);
                            setEditedMeditationName("");
                          }
                        }}
                        className="w-full border-b border-gray-300 font-semibold focus:border-blue-500 focus:outline-none"
                        style={{ width: `${editedMeditationName.length}ch` }}
                      />
                    ) : (
                      <h3 className="font-semibold">
                        {meditation.display_name}
                      </h3>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {meditation.duration}
                    </p>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end space-x-2">
                  <button
                    className="group relative"
                    onClick={() => {
                      setEditingMeditationId(meditation.id);
                      setEditedMeditationName(meditation.display_name);
                    }}
                  >
                    <PencilIcon className="size-5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500" />
                    <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Rename
                    </span>
                  </button>
                  <button
                    className="group relative"
                    onClick={() => deleteMeditation(meditation.id)}
                  >
                    <TrashIcon className="size-5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500" />
                    <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

function PlayIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function PencilIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export default MeditationsList;
