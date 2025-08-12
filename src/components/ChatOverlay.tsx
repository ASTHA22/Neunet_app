import React from 'react';
import ReactDOM from 'react-dom';
import { Box, Button, CloseButton, Icon } from '@chakra-ui/react';
import { FiActivity, FiHome } from 'react-icons/fi';
import { ChatPage } from '../pages/ChatPage';
import { AnimatedLogo } from './AnimatedLogo';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <Box
      position="fixed"
      top={0}
      right={0}
      width={["100vw", "30vw"]}
      height="100vh"
      zIndex={3000}
      bg="white"
      boxShadow="2xl"
      display="flex"
      flexDirection="column"
      borderLeftWidth={1}
      borderColor="gray.200"
      overflowY="auto"
      p={0}
    >

        <Box display="flex" justifyContent="flex-end" alignItems="center" px={2} pt={2}>
  <CloseButton size="lg" onClick={onClose} aria-label="Close chat overlay" />
</Box>

      {/* Header row with assistant name, status, icons, and close cross */}
      
      <Box flex={1} minH={0}>
        <ChatPage />
      </Box>
    </Box>,
    document.body
  );
};

export default ChatOverlay;
