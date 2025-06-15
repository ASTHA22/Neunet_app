import { Button, useDisclosure, Box, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { AnimatedLogo } from './AnimatedLogo'
import { Chat } from './Chat'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { JobFormData } from '../pages/CreateJob';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const GradientButton = styled(motion.button)`
  background: linear-gradient(45deg, #FF69B4, #9C6CFE, #FF1493);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 3s ease infinite;
  color: white;
  padding: 8px 16px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(156, 108, 254, 0.2);
  &:hover {
    box-shadow: 0 6px 20px rgba(156, 108, 254, 0.3);
  }
`

const Sparkle = ({ delay = 0 }) => (
  <motion.div
    style={{
      width: 4,
      height: 4,
      position: 'absolute',
      background: '#FFD700',
      borderRadius: '50%',
    }}
    animate={{
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      delay,
    }}
  />
)

export const ChatWidget = ({ onAIGeneratedJob, candidateId }: { onAIGeneratedJob?: (jobFields: Partial<JobFormData>) => void, candidateId?: string }) => {
  console.log('ChatWidget candidateId:', candidateId);
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box>
      <Box
        as={motion.div}
        position="fixed"
        top={4}
        right={4}
        zIndex={1000}
        opacity={isOpen ? 0 : 1}
        visibility={isOpen ? 'hidden' : 'visible'}
        transition="opacity 0.2s ease-in-out, visibility 0.2s ease-in-out"
      >
        <Box position="relative">
          <GradientButton
            onClick={onOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatedLogo size={20} color="white" />
            <Text>Chat</Text>
          </GradientButton>
          <Sparkle />
          <Box position="absolute" top={-2} right={-2}>
            <Sparkle delay={0.5} />
          </Box>
          <Box position="absolute" bottom={-1} left={-1}>
            <Sparkle delay={1} />
          </Box>
        </Box>
      </Box>
      <Chat isOpen={isOpen} onClose={onClose} onAIGeneratedJob={onAIGeneratedJob} candidateId={candidateId} />
    </Box>
  )
}
