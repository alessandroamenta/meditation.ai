import { useEffect, useState } from 'react';

interface Meditation {
  id: string;
  audio_path: string;
  duration: string;
  signedUrl: string;
}

const MeditationsList = () => {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeditations();
  }, []);

  const fetchMeditations = () => {
    fetch('/api/get-all-meditations')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(setMeditations)
      .catch((error) => {
        setError('Failed to fetch meditations');
        console.error('Error fetching meditations:', error);
      });
  };

  const fetchMeditationAudio = async (meditationId: string) => {
    try {
      const response = await fetch(`/api/get-meditation-audio?meditationId=${meditationId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error('Error fetching meditation audio:', error);
      setError('Failed to fetch meditation audio');
      return null;
    }
  };

  const handlePlayMeditation = async (meditation: Meditation) => {
    const signedUrl = await fetchMeditationAudio(meditation.id);
    if (signedUrl) {
      setCurrentMeditation({ ...meditation, signedUrl });
    }
  };

  const deleteMeditation = async (meditationId: string) => {
    try {
      const response = await fetch(`/api/supabase?meditationId=${meditationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMeditations((prevMeditations) =>
          prevMeditations.filter((meditation) => meditation.id !== meditationId)
        );
        setCurrentMeditation(null);
      } else {
        setError('Failed to delete meditation');
      }
    } catch (error) {
      console.error('Error deleting meditation:', error);
      setError('Failed to delete meditation');
    }
  };

  const renameMeditation = async (meditationId: string) => {
    const newName = prompt('Enter a new name for the meditation:');
    if (newName) {
      try {
        const response = await fetch(`/api/supabase?meditationId=${meditationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newName }),
        });
  
        if (response.ok) {
          setMeditations((prevMeditations) =>
            prevMeditations.map((meditation) =>
              meditation.id === meditationId ? { ...meditation, audio_path: newName } : meditation
            )
          );
        } else {
          setError('Failed to rename meditation');
        }
      } catch (error) {
        console.error('Error renaming meditation:', error);
        setError('Failed to rename meditation');
      }
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <main className="flex-1 flex flex-col gap-4 p-4">
        <div className="grid items-center grid-cols-1 gap-4">
          <h1 className="text-2xl font-bold">Meditation</h1>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <div className="flex flex-col gap-2">
          {meditations.map((meditation) => (
            <div
              key={meditation.id}
              className="grid grid-cols-1 md:grid-cols-6 items-center gap-4 p-4 rounded-lg border hover:bg-gray-100/40 transition-all dark:hover:bg-gray-800/40"
            >
              <div className="flex items-center gap-2 col-span-5">
                <PlayIcon
                  className="h-6 w-6 text-gray-500 dark:text-gray-400 cursor-pointer"
                  onClick={() => handlePlayMeditation(meditation)}
                  />
                <div className="grid grid-cols-1 gap-1">
                  <h3 className="font-semibold cursor-pointer">{meditation.audio_path}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{meditation.duration}</p>
                </div>
              </div>
              <div className="flex justify-end col-span-1 space-x-2">
                <button
                    className="relative group"
                    onClick={() => renameMeditation(meditation.id)}
                >
                    <PencilIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500" />
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Rename
                    </span>
                </button>
                <button
                    className="relative group"
                    onClick={() => deleteMeditation(meditation.id)}
                >
                    <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500" />
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Delete
                    </span>
                </button>
                </div>
            </div>
          ))}
        </div>
      </main>
      {currentMeditation && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <PlayIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <div className="flex flex-col">
                <h3 className="font-semibold">Now Playing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentMeditation.audio_path} - {currentMeditation.duration}
                </p>
              </div>
            </div>
            <div>
              <audio controls autoPlay src={currentMeditation.signedUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      )}
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
    )
  }

export default MeditationsList;