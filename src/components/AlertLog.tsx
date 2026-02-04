'use client';

interface AlertLogProps {
  messages: string[];
}

export default function AlertLog({ messages }: AlertLogProps) {
  if (messages.length === 0) return null;
  
  return (
    <div className="absolute bottom-2 left-2 w-80 bg-gray-900 bg-opacity-90 border border-gray-700 rounded p-2 font-mono text-xs max-h-32 overflow-y-auto">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`py-0.5 ${idx === messages.length - 1 ? 'text-green-400' : 'text-gray-500'}`}
        >
          &gt; {msg}
        </div>
      ))}
    </div>
  );
}
