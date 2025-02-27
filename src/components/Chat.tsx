import {
  Box,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  CloseButton,
  Button,
  Icon,
} from '@chakra-ui/react'
import { FiSend, FiPlus, FiFileText } from 'react-icons/fi'
import { RiDashboardLine } from 'react-icons/ri'
import { BsPersonLinesFill } from 'react-icons/bs'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import { useState } from 'react'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { AnimatedLogo } from './AnimatedLogo'

interface Message {
  text: string;
  sender: string;
}

interface ChatProps {
  isOpen: boolean
  onClose: () => void
}

const ChatInput = ({ message, setMessage, handleSend, handleKeyPress }: any) => (
  <Box p={4} borderTop="1px" borderColor="gray.100">
    <HStack spacing={2}>
      <Input
        placeholder="Message AI Assistant..."
        bg="gray.50"
        border="none"
        size="md"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        _focus={{ 
          bg: 'white',
          ring: 1,
          ringColor: '#9C6CFE'
        }}
        _placeholder={{
          color: 'gray.400'
        }}
      />
      <IconButton
        aria-label="Send message"
        icon={<FiSend />}
        onClick={handleSend}
        bg="#9C6CFE"
        color="white"
        size="md"
        _hover={{ bg: '#8A5EE3' }}
      />
    </HStack>
  </Box>
);

export const Chat = ({ isOpen, onClose }: ChatProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const location = useLocation();
  const isHomePage = location.pathname === '/dashboard';
  const isCreateJobPage = location.pathname === '/create-job';
  const showHelpOnly = location.pathname.includes('/job-listings') || 
                      location.pathname.includes('/job-candidates') ||
                      location.pathname === '/settings';

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: 'user' }]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleClose = () => {
    onClose();
    setMessage('');
    setMessages([]);
  };

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      height="100vh"
      width="30%"
      bg="white"
      boxShadow="-4px 0 12px rgba(0, 0, 0, 0.1)"
      transform={isOpen ? 'translateX(0)' : 'translateX(100%)'}
      transition="transform 0.3s ease-in-out"
      zIndex={1000}
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.100">
        <HStack spacing={3} align="center">
          <AnimatedLogo size={20} />
          <Text fontSize="lg" fontWeight="medium">
            Chatbot
          </Text>
          <Box flex={1} />
          <CloseButton onClick={handleClose} />
        </HStack>
      </Box>

      {/* Title */}
      <Box py={6}>
        <Text fontSize="2xl" fontWeight="medium" textAlign="center">
          How can I help you today?
        </Text>
      </Box>

      {/* Content Area */}
      <Box flex={1} overflowY="auto" display="flex" justifyContent="center">
        {isHomePage && (
          <VStack spacing={3} width="200px" py={4}>
            <Button
              as={RouterLink}
              to="/dashboard"
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={RiDashboardLine} boxSize={5} color="#9C6CFE" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Dashboard
            </Button>
            <Button
              as={RouterLink}
              to="/create-job"
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={FiPlus} boxSize={5} color="#9C6CFE" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Create a job
            </Button>
            <Button
              as={RouterLink}
              to="/job-listings"
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={BsPersonLinesFill} boxSize={5} color="#9C6CFE" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Job listings
            </Button>
            <Button
              as={RouterLink}
              to="/help"
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={HiQuestionMarkCircle} boxSize={5} color="#F97316" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Help
            </Button>
          </VStack>
        )}
        {isCreateJobPage && (
          <VStack spacing={3} width="200px" py={4}>
            <Button
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={FiFileText} boxSize={5} color="#9C6CFE" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Select template
            </Button>
            <Button
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={HiQuestionMarkCircle} boxSize={5} color="#F97316" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Help
            </Button>
          </VStack>
        )}
        {showHelpOnly && (
          <VStack spacing={3} width="200px" py={4}>
            <Button
              variant="outline"
              width="100%"
              height="44px"
              leftIcon={<Icon as={HiQuestionMarkCircle} boxSize={5} color="#F97316" />}
              justifyContent="flex-start"
              fontWeight="normal"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
            >
              Help
            </Button>
          </VStack>
        )}
        {!isHomePage && !isCreateJobPage && !showHelpOnly && (
          <VStack spacing={4} width="200px">
            {messages.map((msg, index) => (
              <Box
                key={index}
                bg={msg.sender === 'user' ? '#8A5EE3' : '#F7F7F7'}
                color={msg.sender === 'user' ? 'white' : 'black'}
                py={2}
                px={4}
                borderRadius="lg"
                alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                maxW="80%"
              >
                <Text>{msg.text}</Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Input Area */}
      <Box p={4} borderTop="1px" borderColor="gray.100">
        <HStack spacing={2}>
          <Input
            placeholder="Message AI Assistant..."
            bg="gray.50"
            border="none"
            size="md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            _focus={{ 
              bg: 'white',
              ring: 1,
              ringColor: '#9C6CFE'
            }}
            _placeholder={{
              color: 'gray.400'
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<FiSend />}
            onClick={handleSend}
            bg="#9C6CFE"
            color="white"
            size="md"
            _hover={{ bg: '#8A5EE3' }}
          />
        </HStack>
      </Box>
    </Box>
  );
};
