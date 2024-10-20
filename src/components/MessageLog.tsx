import React from 'react';

interface MessageLogProps {
   messages: string[];
}

const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
   return (
      <div className="w-1/5 bg-white p-2 overflow-y-auto h-full">
         <h2 className="text-lg font-bold mb-2">Game Log</h2>
         <ul className="space-y-1">
            {messages.map((message, index) => (
               <li key={index} className="text-xs">{message}</li>
            ))}
         </ul>
      </div>
   );
};

export default MessageLog;