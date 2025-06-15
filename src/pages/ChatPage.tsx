import { Box, Container, Input, Text, SimpleGrid, Icon, Link as ChakraLink, HStack, IconButton } from '@chakra-ui/react'
import { FiMessageSquare, FiSend, FiUsers, FiEdit3, FiHelpCircle, FiBriefcase, FiHome } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AnimatedLogo } from '../components/AnimatedLogo'
import { PostLoginQuickActions } from '../components/PostLoginQuickActions'
import { Chat } from '../components/Chat' // No ChatWidget or ChatButton needed on ChatPage

interface QuickLinkProps {
  icon: any
  title: string
  description: string
  to: string
  iconColor?: string
}

const QuickLink = ({ icon, title, description, to, iconColor }: QuickLinkProps) => (
  <ChakraLink
    as={Link}
    to={to}
    display="block"
    p={4}
    bg="white"
    borderRadius="lg"
    _hover={{ bg: 'gray.50' }}
    w="full"
    h="full"
    boxShadow="sm"
  >
    <HStack spacing={3} align="flex-start">
      <Box color={iconColor || "brand.500"} mt={1}>
        <Icon as={icon} boxSize={4} />
      </Box>
      <Box>
        <Text fontWeight="medium" fontSize="md" mb={0.5}>
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {description}
        </Text>
      </Box>
    </HStack>
  </ChakraLink>
)

export const ChatPage = () => {
  const location = useLocation();
  const [inputValue, setInputValue] = useState('');
  // Handler for onboarding quick actions
  const handleOnboardingAction = (action: string) => {
    // Example: You can trigger chat messages or navigate
    if (action === 'view_my_jobs') {
      window.location.href = '/job-listings';
    } else if (action === 'show_all_candidates') {
      window.location.href = '/job-candidates';
    } else if (action === 'create_new_job') {
      window.location.href = '/create-job';
    } else if (action === 'help_faq') {
      window.location.href = '/help';
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // TODO: send message logic
      console.log('Send message:', inputValue);
      setInputValue('');
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="#FAFAFA">
      <Container maxW="container.sm" pt={16} flex="1">
        <Box mb={8}>
          <Text fontSize="2xl" fontWeight="semibold" textAlign="center" mb={2} display="flex" alignItems="center" justifyContent="center" gap={3}>
            <AnimatedLogo size={32} />
            Welcome back!
          </Text>
          <Text fontSize="md" textAlign="center" mb={8} color="gray.700">
            How can I help you today?
          </Text>
          <SimpleGrid columns={2} spacing={4}>
            <QuickLink
              icon={FiHome}
              title="Dashboard"
              description="Visit homepage"
              to="/dashboard"
              iconColor="green.500"
            />
            <QuickLink
              icon={FiEdit3}
              title="Create a Job"
              description="Post a new job opening"
              to="/create-job"
              iconColor="green.500"
            />
            <QuickLink
              icon={FiBriefcase}
              title="Job Listings"
              description="Browse all job postings"
              to="/jobs"
              iconColor="purple.500"
            />
            <QuickLink
              icon={FiUsers}
              title="Candidates"
              description="Browse all candidates"
              to="/job-candidates"
              iconColor="blue.500"
            />
          </SimpleGrid>
        </Box>
      </Container>
      {/* Manual chat entry box (fixed, centered, pixel-perfect) */}
      <Box
        position="fixed"
        left={{ base: 0, md: '250px' }}
        right={0}
        bottom={0}
        py={6}
        zIndex={30}
        display="flex"
        flexDirection="column"
        alignItems="center"
        bg="transparent"
      >
        <Box
          w="100%"
          maxW="480px"
          mx="auto"
          display="flex"
          alignItems="center"
          bg="white"
          borderRadius="xl"
          boxShadow="0 4px 24px 0 rgba(0,0,0,0.08)"
          px={3}
          py={2}
        >
          <Input
            placeholder="Type a message..."
            variant="unstyled"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            flex={1}
            fontSize="sm"
            px={2}
            _focusVisible={{
              outline: 'none',
              boxShadow: 'none'
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<FiSend />}
            colorScheme="purple"
            bg="#7C3AED"
            color="white"
            size="md"
            ml={2}
            _hover={{ bg: '#6D28D9' }}
            _active={{ bg: '#5B21B6' }}
            onClick={() => {
              if (inputValue.trim()) {
                handleSendMessage();
              }
            }}
          />
        </Box>
        <Text mt={2} fontSize="xs" color="gray.400" textAlign="center" maxW="480px">
          AI Assistant can make mistakes. Consider checking important information.
        </Text>
      </Box>
    </Box>
  );
}

