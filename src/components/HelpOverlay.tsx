'use client';

interface HelpOverlayProps {
  onClose: () => void;
}

export default function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center font-mono"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-green-700 rounded p-6 max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-green-400 text-xl mb-4 border-b border-gray-700 pb-2">
          Controls
        </h2>
        
        <div className="space-y-3 text-sm">
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">D</span>
            Designate mining/chopping
          </div>
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">B</span>
            Build mode (walls, floors, beds)
          </div>
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">S</span>
            Create stockpile zone
          </div>
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">Space</span>
            Pause/Resume game
          </div>
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">Escape</span>
            Cancel current mode
          </div>
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">?</span>
            Show this help
          </div>
          <div className="text-gray-400">
            <span className="text-green-300 w-24 inline-block">Click+Drag</span>
            Select area for designation
          </div>
        </div>
        
        <div className="mt-6 text-gray-500 text-xs border-t border-gray-700 pt-4">
          <p className="mb-2">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Mine rock to get stone, chop trees for wood</li>
            <li>Build stockpiles to store resources</li>
            <li>Colonists will eat and sleep automatically</li>
            <li>Keep an eye on needs - hungry colonists work slower</li>
          </ul>
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 rounded border border-gray-700 w-full"
        >
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
}
