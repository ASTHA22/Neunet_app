import { useState } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SuggestedAction {
  type: string;
  suggestion: string;
}

interface ChatResponse {
  response: string;
  suggested_actions?: SuggestedAction[];
}

interface UseChatProps {
  jobId?: number;
  candidateEmail?: string;
}

export const useChat = ({ jobId, candidateEmail }: UseChatProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Send request to backend
      const response = await axios.post<ChatResponse>('/api/v1/chat/send', {
        messages: [...messages, userMessage],
        job_id: jobId,
        candidate_email: candidateEmail
      });

      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update suggested actions
      if (response.data.suggested_actions) {
        setSuggestedActions(response.data.suggested_actions);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestedActions([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    suggestedActions,
    sendMessage,
    clearChat
  };
};
