'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
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
    </div>
  );
}
