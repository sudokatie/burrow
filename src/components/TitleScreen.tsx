'use client';

import { useState } from 'react';
import { Music } from '@/game/Music';
import { Sound } from '@/game/Sound';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-green-400 font-mono">
      <pre className="text-2xl mb-8 text-center">
{`
 ____                              
|  _ \\                             
| |_) |_   _ _ __ _ __ _____      __
|  _ <| | | | '__| '__/ _ \\ \\ /\\ / /
| |_) | |_| | |  | | | (_) \\ V  V / 
|____/ \\__,_|_|  |_|  \\___/ \\_/\\_/  
`}
      </pre>
      
      <p className="text-lg mb-4 text-gray-400">
        A colony survival game
      </p>
      
      <div className="text-sm text-gray-500 mb-8 text-center max-w-md">
        <p>Dig, build, and survive with your colonists.</p>
        <p>Manage their needs, assign tasks, and fend off... well, mostly boredom.</p>
      </div>
      
      <button
        onClick={onStart}
        className="px-8 py-3 bg-green-800 hover:bg-green-700 text-green-200 rounded border border-green-600 transition-colors"
      >
        [ START GAME ]
      </button>
      
      <div className="mt-8 text-xs text-gray-600">
        <p>Press ? for help during gameplay</p>
      </div>

      {/* Audio Settings */}
      <div className="mt-6 p-4 bg-gray-900/80 rounded border border-green-800 w-56">
        <h3 className="text-xs font-medium text-green-500 mb-3 text-center">[ AUDIO ]</h3>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-500">Music</label>
            <button
              onClick={toggleMusic}
              className={`px-2 py-0.5 text-xs ${
                musicEnabled ? 'text-green-400' : 'text-gray-600'
              }`}
            >
              [{musicEnabled ? 'ON' : 'OFF'}]
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            disabled={!musicEnabled}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-500">Sound</label>
            <button
              onClick={toggleSound}
              className={`px-2 py-0.5 text-xs ${
                soundEnabled ? 'text-green-400' : 'text-gray-600'
              }`}
            >
              [{soundEnabled ? 'ON' : 'OFF'}]
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundVolume}
            onChange={handleSoundVolumeChange}
            disabled={!soundEnabled}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
