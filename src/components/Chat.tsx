import React, { useState, useEffect, useRef } from 'react';
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
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { AnimatedLogo } from './AnimatedLogo'
import { generateJobDescription } from '../services/api';
import { JobFormData } from '../pages/CreateJob';

interface Message {
  text: string;
  sender: string;
}

interface ChatProps {
  isOpen: boolean
  onClose: () => void
  onAIGeneratedJob?: (jobFields: Partial<JobFormData>) => void
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

export const Chat = ({ isOpen, onClose, onAIGeneratedJob }: ChatProps) => {
  console.log('[CHAT] Chat mounted');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const location = useLocation();
  const isHomePage = location.pathname === '/dashboard';
  const isCreateJobPage = location.pathname === '/create-job';
  const showHelpOnly = location.pathname.includes('/job-listings') || 
                      location.pathname.includes('/job-candidates') ||
                      location.pathname === '/settings';

  // --- Conversational AI Job Description Generation State ---
  const [aiGenState, setAiGenState] = useState<'idle' | 'awaiting_title' | 'awaiting_company' | 'awaiting_location' | 'awaiting_type' | 'awaiting_description' | 'generating'>('idle');
  const [aiGenData, setAiGenData] = useState<any>({});

  // --- Auto-scroll ref ---
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Conversational flow handler
  const handleAIGenerateClick = () => {
    setAiGenState('awaiting_title');
    setMessages(prev => [...prev, { text: 'Let\'s generate a job description! What is the job title?', sender: 'assistant' }]);
  };

  const handleUserInputForAI = async (msg: string) => {
    if (aiGenState === 'awaiting_title') {
      setAiGenData((prev: any) => ({ ...prev, title: msg }));
      setAiGenState('awaiting_company');
      setMessages(prev => [...prev, { text: msg, sender: 'user' }, { text: 'What is the company name?', sender: 'assistant' }]);
      setMessage('');
      return;
    }
    if (aiGenState === 'awaiting_company') {
      setAiGenData((prev: any) => ({ ...prev, company_name: msg }));
      setAiGenState('awaiting_location');
      setMessages(prev => [...prev, { text: msg, sender: 'user' }, { text: 'Where is the job located?', sender: 'assistant' }]);
      setMessage('');
      return;
    }
    if (aiGenState === 'awaiting_location') {
      setAiGenData((prev: any) => ({ ...prev, location: msg }));
      setAiGenState('awaiting_type');
      setMessages(prev => [...prev, { text: msg, sender: 'user' }, { text: 'What is the job type? (e.g., Full-time, Part-time, Contract)', sender: 'assistant' }]);
      setMessage('');
      return;
    }
    if (aiGenState === 'awaiting_type') {
      setAiGenData((prev: any) => ({ ...prev, job_type: msg }));
      setAiGenState('awaiting_description');
      setMessages(prev => [...prev, { text: msg, sender: 'user' }, { text: 'Any specific description or requirements? (Or type "skip")', sender: 'assistant' }]);
      setMessage('');
      return;
    }
    if (aiGenState === 'awaiting_description') {
      setAiGenData((prev: any) => ({ ...prev, description: msg === 'skip' ? '' : msg }));
      setAiGenState('generating');
      setMessages(prev => [...prev, { text: msg, sender: 'user' }, { text: 'Generating job description with AI...', sender: 'assistant' }]);
      setMessage('');
      try {
        const aiResult = await generateJobDescription({ ...aiGenData, description: msg === 'skip' ? '' : msg });
        const formatted = [
          aiResult.job_title ? `**Job Title:** ${aiResult.job_title}` : '',
          aiResult.company_name ? `**Company:** ${aiResult.company_name}` : '',
          aiResult.about_the_role ? `**Description:** ${aiResult.about_the_role}` : (aiResult.description || aiResult.job_description || ''),
          aiResult.key_responsibilities && aiResult.key_responsibilities.length ? `**Responsibilities:**\n- ${aiResult.key_responsibilities.join('\n- ')}` : '',
          aiResult.qualifications && aiResult.qualifications.length ? `**Qualifications:**\n- ${aiResult.qualifications.join('\n- ')}` : '',
          aiResult.skills_and_competencies && aiResult.skills_and_competencies.length ? `**Skills & Competencies:**\n- ${aiResult.skills_and_competencies.join('\n- ')}` : '',
          aiResult.benefits && aiResult.benefits.length ? `**Benefits:**\n- ${aiResult.benefits.join('\n- ')}` : '',
          aiResult.salary_range || aiResult.estimated_pay_range ? `**Salary Range:** ${aiResult.salary_range || aiResult.estimated_pay_range}` : '',
          aiResult.job_level ? `**Job Level:** ${aiResult.job_level}` : '',
          aiResult.time_commitment ? `**Time Commitment:** ${aiResult.time_commitment}` : '',
          aiResult.location ? `**Location:** ${aiResult.location}` : '',
        ].filter(Boolean).join('\n\n');
        setMessages(prev => [...prev, { text: formatted || 'AI could not generate a description.', sender: 'assistant' }]);
        const jobFields: Partial<JobFormData> = {
          title: aiResult.job_title || '',
          company_name: aiResult.company_name || '',
          location: aiResult.location || '',
          job_type: aiResult.job_type || '',
          description: aiResult.about_the_role || aiResult.description || aiResult.job_description || '',
          requirements: aiResult.qualifications ? aiResult.qualifications.join('\n') : (aiResult.skills_and_competencies ? aiResult.skills_and_competencies.join('\n') : ''),
          responsibilities: aiResult.key_responsibilities ? aiResult.key_responsibilities.join('\n') : '',
          salary_range: aiResult.salary_range || aiResult.estimated_pay_range || '',
          tech_stack: aiResult.skills_and_competencies ? aiResult.skills_and_competencies.join(', ') : '',
          growth_opportunities: aiResult.growth_opportunities || '',
          benefits: aiResult.benefits ? aiResult.benefits.join('\n') : '',
          about_company: aiResult.about_company || (aiResult.company_name ? `${aiResult.company_name} is a leading company in its field.` : ''),
          job_level: aiResult.job_level || '',
          time_commitment: aiResult.time_commitment || '',
        };
        console.log('[AIGEN] Generated jobFields for guided flow:', jobFields);
        if (typeof onAIGeneratedJob === 'function') {
          console.log('[CHAT] Calling onAIGeneratedJob with:', jobFields, typeof onAIGeneratedJob);
          onAIGeneratedJob(jobFields);
        }
      } catch (err) {
        setMessages(prev => [...prev, { text: 'Failed to generate job description.', sender: 'assistant' }]);
      }
      setAiGenState('idle');
      setAiGenData({});
      return;
    }
  };

  // Modified handleSend to support conversational AI flow and free-form job description generation
  const handleSend = async () => {
    if (aiGenState !== 'idle') {
      await handleUserInputForAI(message.trim());
      return;
    }
    if (message.trim()) {
      // Detect free-form AI job description requests
      const aiGenRegex = /generate (an? )?(ai )?(job )?description for (.+)/i;
      const match = message.trim().match(aiGenRegex);
      if (match) {
        const role = match[4].trim();
        setMessages([...messages, { text: message, sender: 'user' }, { text: `Generating AI job description for ${role}...`, sender: 'assistant' }]);
        setMessage('');
        try {
          // Call generateJobDescription with just the title/role, other fields blank
          const aiResult = await generateJobDescription({ title: role });
          const formatted = [
            aiResult.job_title ? `**Job Title:** ${aiResult.job_title}` : '',
            aiResult.company_name ? `**Company:** ${aiResult.company_name}` : '',
            aiResult.about_the_role ? `**Description:** ${aiResult.about_the_role}` : (aiResult.description || aiResult.job_description || ''),
            aiResult.key_responsibilities && aiResult.key_responsibilities.length ? `**Responsibilities:**\n- ${aiResult.key_responsibilities.join('\n- ')}` : '',
            aiResult.qualifications && aiResult.qualifications.length ? `**Qualifications:**\n- ${aiResult.qualifications.join('\n- ')}` : '',
            aiResult.skills_and_competencies && aiResult.skills_and_competencies.length ? `**Skills & Competencies:**\n- ${aiResult.skills_and_competencies.join('\n- ')}` : '',
            aiResult.benefits && aiResult.benefits.length ? `**Benefits:**\n- ${aiResult.benefits.join('\n- ')}` : '',
            aiResult.salary_range || aiResult.estimated_pay_range ? `**Salary Range:** ${aiResult.salary_range || aiResult.estimated_pay_range}` : '',
            aiResult.job_level ? `**Job Level:** ${aiResult.job_level}` : '',
            aiResult.time_commitment ? `**Time Commitment:** ${aiResult.time_commitment}` : '',
            aiResult.location ? `**Location:** ${aiResult.location}` : '',
          ].filter(Boolean).join('\n\n');
          setMessages(prev => [...prev, { text: formatted || 'AI could not generate a description.', sender: 'assistant' }]);
          const jobFields: Partial<JobFormData> = {
            title: aiResult.job_title || role,
            company_name: aiResult.company_name || '',
            location: aiResult.location || '',
            job_type: aiResult.job_type || '',
            description: aiResult.about_the_role || aiResult.description || aiResult.job_description || '',
            requirements: aiResult.qualifications ? aiResult.qualifications.join('\n') : (aiResult.skills_and_competencies ? aiResult.skills_and_competencies.join('\n') : ''),
            responsibilities: aiResult.key_responsibilities ? aiResult.key_responsibilities.join('\n') : '',
            salary_range: aiResult.salary_range || aiResult.estimated_pay_range || '',
            tech_stack: aiResult.skills_and_competencies ? aiResult.skills_and_competencies.join(', ') : '',
            growth_opportunities: aiResult.growth_opportunities || '',
            benefits: aiResult.benefits ? aiResult.benefits.join('\n') : '',
            about_company: aiResult.about_company || (aiResult.company_name ? `${aiResult.company_name} is a leading company in its field.` : ''),
            job_level: aiResult.job_level || '',
            time_commitment: aiResult.time_commitment || '',
          };
          if (typeof onAIGeneratedJob === 'function') {
            console.log('[CHAT] Calling onAIGeneratedJob with:', jobFields, typeof onAIGeneratedJob);
            onAIGeneratedJob(jobFields);
          }
        } catch (err) {
          setMessages(prev => [...prev, { text: 'Failed to generate job description.', sender: 'assistant' }]);
        }
        return;
      }
      // Default: just add message to chat
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
      <Box flex={1} overflowY="auto" display="flex" flexDirection="column" alignItems="center">
        {/* Buttons and chat both visible on /create-job */}
        {location.pathname === '/create-job' && (
          <>
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
              <Button
                variant="solid"
                width="100%"
                height="44px"
                leftIcon={<Icon as={FiSend} boxSize={5} color="white" />}
                justifyContent="flex-start"
                fontWeight="bold"
                color="white"
                bg="#9C6CFE"
                _hover={{ bg: '#8A5EE3' }}
                onClick={handleAIGenerateClick}
              >
                Generate with AI
              </Button>
            </VStack>
            {/* Chat conversation area */}
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
              <div ref={chatBottomRef} />
            </VStack>
          </>
        )}
        {/* Job Listings, Candidates, Settings: Select template + Help */}
        {(location.pathname.includes('/job-listings') || location.pathname.includes('/job-candidates') || location.pathname === '/settings' || location.pathname === '/jobs') && (
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
        {/* Other routes */}
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
        {showHelpOnly && !isCreateJobPage && (
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
      </Box>

      {/* Input Area */}
      {(location.pathname === '/chat' || location.pathname === '/create-job') && (
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
      )}
    </Box>
  );
};
