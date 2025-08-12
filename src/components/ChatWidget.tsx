import { Button, useDisclosure, Box, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { AnimatedLogo } from './AnimatedLogo'
import Chat from './Chat'
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

// On home page, ChatWidget behaves like ChatPage by passing fullPage=true to Chat
import { useParams, useLocation } from 'react-router-dom';

function extractIdsFromPath(pathname: string) {
  let candidateId, jobId;
  // /jobs/:jobId/candidates or /job-candidates/:jobId
  let jobMatch = pathname.match(/(?:jobs|job-candidates)\/(\w+)/);
  if (jobMatch) jobId = jobMatch[1];
  // /candidates/:candidateId
  let candMatch = pathname.match(/candidates\/(\w+)/);
  if (candMatch) candidateId = candMatch[1];
  return { candidateId, jobId };
}

export const ChatWidget = ({ onAIGeneratedJob, candidateId: candidateIdProp, fullPage = false }: { onAIGeneratedJob?: (jobFields: Partial<JobFormData>) => void, candidateId?: string, fullPage?: boolean }) => {
  const params = useParams<{ jobId?: string; candidateId?: string }>();
  const location = useLocation();
  let candidateId = candidateIdProp || params.candidateId;
  let jobId = params.jobId;
  // Fallback: parse from pathname
  if (!candidateId || !jobId) {
    const ids = extractIdsFromPath(location.pathname);
    candidateId = candidateId || ids.candidateId;
    jobId = jobId || ids.jobId;
  }
  console.log('ChatWidget candidateId:', candidateId, 'jobId:', jobId, 'params:', params, 'prop:', candidateIdProp);
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      {/* Robin Button (only show when chat is closed) */}
      {!isOpen && (
        <Box position="fixed" top={4} right={4} zIndex={1000}>
          <GradientButton
            onClick={onOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatedLogo size={20} color="white" />
            <Text>Robin</Text>
          </GradientButton>
          <Sparkle />
          <Box position="absolute" top={-2} right={-2}>
            <Sparkle delay={0.5} />
          </Box>
          <Box position="absolute" bottom={-1} left={-1}>
            <Sparkle delay={1} />
          </Box>
        </Box>
      )}
      {/* Chat slide-in overlay (only show when open) */}
      {isOpen && (
        <Box
          as={motion.div}
          position="fixed"
          top={0}
          right={0}
          height="100vh"
          width={["100vw", "30vw"]}
          zIndex={1100}
          bg="white"
          boxShadow="lg"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Chat
            isOpen={isOpen}
            onClose={onClose}
            onAIGeneratedJob={onAIGeneratedJob}
            candidateId={candidateId}
            jobId={jobId}
            fullPage={fullPage}
            // Pass through quickActions and sendMessage if Chat supports them
          />
          {/* Quick Actions (identical to ChatPage) */}
          <Box p={2} bg="gray.50" borderTopWidth={1} borderColor="gray.200">
            <HStack spacing={2} justify="center">
              <Button size="sm" leftIcon={<span>👑</span>} onClick={() => {/* sendMessage('show top candidates') via Chat ref */}}>Show top candidates</Button>
              <Button size="sm" leftIcon={<span>💼</span>} onClick={() => {/* sendMessage('show jobs applied') via Chat ref */}}>Show jobs applied</Button>
              <Button size="sm" leftIcon={<span>📝</span>} onClick={() => {/* sendMessage('summarize candidate') via Chat ref */}}>Summarize candidate</Button>
              <Button size="sm" leftIcon={<span>❓</span>} onClick={() => {/* sendMessage('help') via Chat ref */}}>Help</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </>
  );
}


