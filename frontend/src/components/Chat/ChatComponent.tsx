import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Flex,
  IconButton,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiSend, FiTrash2 } from 'react-icons/fi';

interface ChatComponentProps {
  jobId?: number;
  candidateEmail?: string;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({
  jobId,
  candidateEmail,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    error,
    suggestedActions,
    sendMessage,
    clearChat,
  } = useChat({ jobId, candidateEmail });

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userMsgBg = useColorModeValue('blue.500', 'blue.200');
  const assistantMsgBg = useColorModeValue('gray.200', 'gray.600');

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await sendMessage(input);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSuggestedAction = async (suggestion: string) => {
    try {
      await sendMessage(suggestion);
    } catch (err) {
      console.error('Error sending suggested action:', err);
    }
  };

  return (
    <Box
      h="600px"
      maxW="800px"
      w="100%"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
    >
      {/* Messages Container */}
      <VStack h="100%" spacing={0}>
        <Box
          flex="1"
          w="100%"
          overflowY="auto"
          p={4}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: borderColor,
              borderRadius: '24px',
            },
          }}
        >
          {/* Error Alert */}
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Chat Messages */}
          <VStack spacing={4} align="stretch">
            {messages.map((msg, index) => (
              <Flex
                key={index}
                justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              >
                <Box
                  maxW="70%"
                  bg={msg.role === 'user' ? userMsgBg : assistantMsgBg}
                  color={msg.role === 'user' ? 'white' : 'inherit'}
                  p={3}
                  borderRadius="lg"
                >
                  <Text>{msg.content}</Text>
                </Box>
              </Flex>
            ))}
            {isLoading && (
              <Flex justify="flex-start">
                <Box bg={assistantMsgBg} p={3} borderRadius="lg">
                  <Spinner size="sm" />
                </Box>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <VStack mt={4} spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium">
                Suggested Actions:
              </Text>
              {suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuggestedAction(action.suggestion)}
                >
                  {action.suggestion}
                </Button>
              ))}
            </VStack>
          )}
        </Box>

        {/* Input Form */}
        <Box
          w="100%"
          p={4}
          borderTop="1px"
          borderColor={borderColor}
          bg={useColorModeValue('white', 'gray.800')}
        >
          <form onSubmit={handleSubmit}>
            <HStack spacing={2}>
              <IconButton
                aria-label="Clear chat"
                icon={<FiTrash2 />}
                onClick={clearChat}
                size="md"
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                size="md"
                disabled={isLoading}
              />
              <IconButton
                aria-label="Send message"
                icon={<FiSend />}
                type="submit"
                colorScheme="blue"
                disabled={!input.trim() || isLoading}
                size="md"
              />
            </HStack>
          </form>
        </Box>
      </VStack>
    </Box>
  );
};
