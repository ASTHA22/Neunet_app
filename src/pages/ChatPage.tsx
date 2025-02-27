import { Box, Container, Input, Text, SimpleGrid, Icon, Link as ChakraLink, HStack, IconButton } from '@chakra-ui/react'
import { FiHome, FiEdit3, FiUsers, FiHelpCircle, FiSend } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AnimatedLogo } from '../components/AnimatedLogo'

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
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([])

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isBot: false }])
      setMessage('')
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I'll help you with that! What specific information do you need?",
          isBot: true 
        }])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="#FAFAFA">
      <Container maxW="container.sm" pt={16} flex="1">
        <Box mb={8}>
          <Text fontSize="2xl" fontWeight="semibold" textAlign="center" mb={8} display="flex" alignItems="center" justifyContent="center" gap={3}>
            <AnimatedLogo size={32} />
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
              title="Create a job"
              description="Generate new job posting"
              to="/create-job"
              iconColor="#9C6CFE"
            />
            <QuickLink
              icon={FiUsers}
              title="Job listings"
              description="Check the job listings & candidates"
              to="/job-listings"
              iconColor="purple.500"
            />
            <QuickLink
              icon={FiHelpCircle}
              title="Help"
              description="Assist with application"
              to="/help"
              iconColor="orange.500"
            />
          </SimpleGrid>
        </Box>

        {messages.length > 0 && (
          <Box mb={8}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                bg={msg.isBot ? 'gray.100' : '#9C6CFE'}
                color={msg.isBot ? 'black' : 'white'}
                py={2}
                px={4}
                borderRadius="lg"
                mb={2}
                maxW="80%"
                ml={msg.isBot ? 0 : 'auto'}
              >
                <Text>{msg.text}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      <Box py={6}>
        <Container maxW="container.sm">
          <Box>
            <Box position="relative" mb={2}>
              <Input
                placeholder="Message AI Assistant..."
                size="lg"
                bg="white"
                pr="40px"
                borderRadius="md"
                fontSize="sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                border="1px solid"
                borderColor="gray.200"
                _focus={{
                  borderColor: '#9C6CFE',
                  boxShadow: 'none'
                }}
                h="50px"
              />
              <IconButton
                aria-label="Send message"
                icon={<FiSend />}
                onClick={handleSend}
                bg="#9C6CFE"
                color="white"
                size="sm"
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                _hover={{ bg: '#8A5EE3' }}
              />
            </Box>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              AI Assistant can make mistakes. Consider checking important information
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
