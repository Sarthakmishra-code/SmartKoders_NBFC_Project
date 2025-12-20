import { Bot, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ message, metadata }) => {
  const isUser = message.sender === 'user';
  const parsedMetadata = message.metadata ? JSON.parse(message.metadata) : {};

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary-600' : 'bg-gray-600'
          }`}>
            {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-primary-600 text-white' 
              : 'bg-white border border-gray-200'
          }`}>
            <p className="whitespace-pre-wrap">{message.message}</p>
            
            {/* Suggestions */}
            {parsedMetadata.suggestions && (
              <div className="mt-3 space-y-2">
                {parsedMetadata.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="block w-full text-left px-3 py-2 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <span className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;