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
  Avatar,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  useToast
} from '@chakra-ui/react'
import { FiSend, FiPlus, FiFileText } from 'react-icons/fi'
import { RiDashboardLine } from 'react-icons/ri'
import { BsPersonLinesFill } from 'react-icons/bs'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { AnimatedLogo } from './AnimatedLogo'
import { generateJobDescription, getCandidateById, getJobCandidates, sendEmail } from '../services/api';
import { JobFormData } from '../pages/CreateJob';
import { useParams } from 'react-router-dom';

// Helper to render different message types
interface MessageContent {
  type: string;
  [key: string]: any;
}

function renderChatMessage(content: string | MessageContent) {
  // If it's a string, wrap it in a message object
  if (typeof content === 'string') {
    return <Text whiteSpace="pre-line">{content}</Text>;
  }

  // Handle different message types
  if (!content || typeof content !== 'object') {
    return <Text color="red.500">[Invalid message format]</Text>;
  }

  // Handle top candidates
  if (content.type === 'topCandidates' && Array.isArray(content.candidates)) {
    const candidates = content.candidates;
    return (
      <VStack align="stretch" spacing={3}>
        <Text fontWeight="bold" mb={2}>Top Candidates for this Job:</Text>
        {candidates.map((c: any) => (
          <HStack key={c.idx + c.email} p={3} bg="gray.100" borderRadius="md" boxShadow="xs">
            <Avatar name={c.name} size="sm" />
            <Box flex="1">
              <Text fontWeight="semibold">{c.name}</Text>
              {c.email && <Text fontSize="sm" color="gray.600">{c.email}</Text>}
            </Box>
            <Badge colorScheme="purple">{c.ranking}</Badge>
            <Badge colorScheme={c.status === 'shortlisted' ? 'green' : c.status === 'applied' ? 'blue' : c.status === 'rejected' ? 'red' : 'gray'}>
              {c.status || 'N/A'}
            </Badge>
          </HStack>
        ))}
      </VStack>
    );
  }
  // Handle jobs applied cards
  if (content.type === 'jobs_applied_cards' && Array.isArray(content.jobs)) {
    const jobs = content.jobs;
    return (
      <VStack align="stretch" spacing={3} mt={2} mb={2}>
        {jobs.map((job: any, idx: number) => (
          <Box key={job.job_id || idx} borderWidth="1px" borderRadius="lg" p={3} bg="white" boxShadow="xs">
            <HStack justify="space-between" mb={1}>
              <Text fontWeight="bold" fontSize="md">{job.title}</Text>
              <Badge colorScheme={job.status === 'Shortlisted' ? 'green' : job.status === 'Rejected' ? 'red' : job.status === 'Applied' ? 'purple' : 'gray'}>{job.status}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">Job ID: {job.job_id}</Text>
            {job.appliedAt && <Text fontSize="xs" color="gray.400">Applied: {job.appliedAt}</Text>}
          </Box>
        ))}
      </VStack>
    );
  }
  // Fallback for unknown message types
  return (
    <Text color="red.500">
      [Unsupported message format: {content.type || 'unknown'}]
      {JSON.stringify(content, null, 2)}
    </Text>
  );
}


// --- Context-aware chat quick actions ---
const ChatQuickActions = ({ location, onAction }: { location: any, onAction: (action: string) => void }) => {
  // Show candidate-specific actions if on any candidate details route
  const isCandidatePage =
    /\/candidate(\W|$)/.test(location.pathname) ||
    /\/candidate-details(\W|$)/.test(location.pathname) ||
    /\/job-candidates\/[^/]+\/candidate\//.test(location.pathname);

  if (isCandidatePage) {
    return (
      <VStack spacing={2} mb={4} align="stretch">
        <Button colorScheme="purple" variant="outline" onClick={() => onAction('see_jobs_applied')}>See jobs applied</Button>
        <Button colorScheme="purple" variant="outline" onClick={() => onAction('send_email')}>Send email</Button>
      </VStack>
    );
  }

  if (location.pathname.includes('/job-candidates')) {
    return (
      <VStack spacing={2} mb={4} align="stretch">
        <Button colorScheme="purple" variant="outline" onClick={() => onAction('top_20')}>Show top 20 candidates</Button>
        <Button colorScheme="purple" variant="outline" onClick={() => onAction('top_10_percent')}>Show top 10% candidates</Button>
      </VStack>
    );
  }
  return null;
};


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

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  onAIGeneratedJob?: (jobFields: Partial<JobFormData>) => void;
  candidateId?: string;
}

export const Chat = ({ isOpen, onClose, onAIGeneratedJob, candidateId: candidateIdProp }: ChatProps) => {
  console.log('Chat candidateIdProp:', candidateIdProp);
  const params = useParams<{ jobId?: string; candidateId?: string }>();
  const location = useLocation();
  // Use prop if provided, otherwise fallback to params
  const candidateId = candidateIdProp || params.candidateId;
  let jobId = params.jobId;
  console.log('Chat candidateId (used):', candidateId);
  // Fallback: try to extract jobId from pathname if not available in params
  if (!jobId && location.pathname.includes('/job-candidates/')) {
    const match = location.pathname.match(/\/job-candidates\/(\w+)/);
    if (match && match[1]) {
      jobId = match[1];
    }
  }

  // Helper: Open email modal with candidate's email
  const handleOpenEmailModal = async () => {
    if (!candidateId) {
      toast({ title: 'No candidate selected.', status: 'error' });
      return;
    }
    try {
      const candidate = await getCandidateById(candidateId);
      setEmailTo(candidate.email || '');
      setEmailSubject('');
      setEmailBody('');
      openEmailModal();
    } catch (err) {
      toast({ title: 'Could not fetch candidate email.', status: 'error' });
    }
  };

  // Helper: Send email
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await sendEmail({ to: [emailTo], subject: emailSubject, body: emailBody });
      if (result.success) {
        setMessages(prev => [...prev, { text: `Email sent to ${emailTo}.`, sender: 'assistant' }]);
        toast({ title: 'Email sent!', status: 'success' });
        closeEmailModal();
      } else {
        setMessages(prev => [...prev, { text: `Failed to send email: ${result.error}`, sender: 'assistant' }]);
        toast({ title: 'Failed to send email', description: result.error, status: 'error' });
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { text: `Failed to send email: ${err?.message || err}`, sender: 'assistant' }]);
      toast({ title: 'Failed to send email', description: err?.message || String(err), status: 'error' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Helper: Fetch jobs applied for candidate
  const fetchJobsApplied = async (cid: string) => {
    if (!cid) return 'No candidate selected.';
    try {
      const candidate = await getCandidateById(cid);
      console.log('Fetched candidate:', candidate);
      const jobs = candidate.jobsApplied || candidate.jobs_applied || [];
      if (!candidate || jobs.length === 0) {
        return 'No jobs applied.';
      }
      // Render jobs as styled cards using Chakra UI
      return {
        type: 'jobs_applied_cards',
        jobs: jobs.map((job: any, idx: number) => ({
          idx,
          title: job.title || 'Untitled',
          job_id: job.job_id,
          status: job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown',
          appliedAt: job.applied_at ? new Date(job.applied_at).toLocaleDateString() : '',
        }))
      };
    } catch (err) {
      return 'Failed to fetch jobs applied.';
    }
  };

  // Helper: Fetch top candidates for a job
  const fetchTopCandidates = async (jid: string, count?: number, percent?: number) => {
    try {
      const candidates = await getJobCandidates(jid);
      if (!Array.isArray(candidates) || candidates.length === 0) {
        return 'No candidates found for this job.';
      }
      // Sort by ranking/score (descending)
      const sorted = [...candidates].sort((a: any, b: any) => (b.ranking ?? b.score ?? 0) - (a.ranking ?? a.score ?? 0));
      let top: any[] = sorted;
      if (count) {
        top = sorted.slice(0, count);
      } else if (percent) {
        top = sorted.slice(0, Math.max(1, Math.floor(sorted.length * percent)));
      }
      // Format
      // Instead of returning plain text, return a special marker with JSON string for rendering
      const formattedCandidates = top.map((c, idx) => ({
        idx: idx + 1,
        name: c.name || c.email || 'Unknown',
        email: c.email || '',
        ranking: c.ranking ?? c.score ?? 0,
        status: c.status || '',
      }));
      return JSON.stringify({ type: 'topCandidates', candidates: formattedCandidates });
    } catch (err) {
      return 'Failed to fetch candidates for this job.';
    }
  };


  console.log('[CHAT] Chat mounted');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // --- Email Modal State ---
  const { isOpen: isEmailModalOpen, onOpen: openEmailModal, onClose: closeEmailModal } = useDisclosure();
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const toast = useToast();
  // location already declared above, reuse here
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

  // --- Quick Action Handler ---
  const handleQuickAction = (action: string) => {
    if (action === 'top_20') {
      setMessages(prev => [...prev, { text: 'Showing top 20 candidates...', sender: 'assistant' }]);
      if (jobId) {
        fetchTopCandidates(jobId, 20).then(result => {
          setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
        });
      } else {
        setMessages(prev => [...prev, { text: 'No job in context.', sender: 'assistant' }]);
      }
      return;
    }
    if (action === 'top_10_percent') {
      setMessages(prev => [...prev, { text: 'Showing top 10% candidates...', sender: 'assistant' }]);
      if (jobId) {
        fetchTopCandidates(jobId, undefined, 0.1).then(result => {
          setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
        });
      } else {
        setMessages(prev => [...prev, { text: 'No job in context.', sender: 'assistant' }]);
      }
      return;
    }
    if (action === 'see_jobs_applied') {
      console.log('[QuickAction] candidateId at click:', candidateId);
      if (!candidateId) {
        setMessages(prev => [...prev, { text: 'No candidate in context (handler). Please reload or check route.', sender: 'assistant' }]);
        return;
      }
      setMessages(prev => [...prev, { text: 'Fetching jobs applied by this candidate...', sender: 'assistant' }]);
      fetchJobsApplied(candidateId).then((result) => {
        setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
      });
      return;
    }
    if (action === 'send_email') {
      setMessages(prev => [...prev, { text: 'Opening email composer for this candidate...', sender: 'assistant' }]);
      handleOpenEmailModal();
      return;
    }
  };

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
      // --- Context-aware user queries ---
      const msg = message.trim().toLowerCase();
      // Support 'show top candidate', 'show top X candidate(s)'
      const topXMatch = msg.match(/top (\d+) candidates?/);
      if (topXMatch) {
        const count = parseInt(topXMatch[1], 10);
        setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: `Showing top ${count} candidate${count === 1 ? '' : 's'}...`, sender: 'assistant' }]);
        if (jobId) {
          fetchTopCandidates(jobId, count).then(result => {
            setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
          });
        } else {
          setMessages(prev => [...prev, { text: 'No job in context.', sender: 'assistant' }]);
        }
        setMessage('');
        return;
      }
      // Support 'show top candidate' (no number, singular)
      if (msg.includes('top candidate')) {
        setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: 'Showing top candidate...', sender: 'assistant' }]);
        if (jobId) {
          fetchTopCandidates(jobId, 1).then(result => {
            setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
          });
        } else {
          setMessages(prev => [...prev, { text: 'No job in context.', sender: 'assistant' }]);
        }
        setMessage('');
        return;
      }
      // Support 'show top X% candidate(s)'
      const topPercentMatch = msg.match(/top (\d+)% candidates?/);
      if (topPercentMatch) {
        const percent = parseInt(topPercentMatch[1], 10);
        setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: `Showing top ${percent}% candidate${percent === 1 ? '' : 's'}...`, sender: 'assistant' }]);
        if (jobId) {
          fetchTopCandidates(jobId, undefined, percent / 100).then(result => {
            setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
          });
        } else if (candidateId) {
          fetchJobsApplied(candidateId).then((result) => {
            setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
          });
        } else {
          setMessages(prev => [...prev, { text: 'No candidate in context.', sender: 'assistant' }]);
        }
        setMessage('');
        return;
      }
      if (msg.includes('send email')) {
        setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: 'Opening email composer for this candidate...', sender: 'assistant' }]);
        handleOpenEmailModal();
        setMessage('');
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
            Robin
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
        {/* On /create-job, show AI button, else context-aware quick actions */}
        {isCreateJobPage ? (
          <VStack spacing={2} mb={4} align="stretch">
            <Button colorScheme="purple" variant="outline" width="100%" onClick={handleAIGenerateClick}>
              Generate with AI
            </Button>
          </VStack>
        ) : (
          <ChatQuickActions location={location} onAction={handleQuickAction} />
        )}
        {/* Chat conversation area */}
        <VStack spacing={4} width="200px">
          <VStack spacing={4} width="100%" px={4} align="stretch">
            {messages.map((msg, idx) => {
              let content = msg.text;
              // If content is a string that looks like JSON, try to parse it
              if (typeof content === 'string' && content.trim().startsWith('{') && content.trim().endsWith('}')) {
                try {
                  content = JSON.parse(content);
                } catch (e) {
                  console.warn('Failed to parse message as JSON:', content);
                }
              }
              // If content is already an object, use it directly
              const messageContent = typeof content === 'object' ? content : { type: 'text', content };
              
              return (
                <Box 
                  key={idx} 
                  alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                  maxW="80%"
                  bg={msg.sender === 'user' ? 'purple.50' : 'gray.50'}
                  p={3}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  {renderChatMessage(messageContent)}
                </Box>
              );
            })}
            <div ref={chatBottomRef} />
          </VStack>
        </VStack>

        {/* Email Compose Modal */}
        <Modal isOpen={isEmailModalOpen} onClose={closeEmailModal} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Send Email to Candidate</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={4}>
              <FormControl mb={3} isDisabled>
                <FormLabel>To</FormLabel>
                <Input value={emailTo} isReadOnly />
              </FormControl>
              <FormControl mb={3} isRequired>
                <FormLabel>Subject</FormLabel>
                <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Subject" />
              </FormControl>
              <FormControl mb={3} isRequired>
                <FormLabel>Body</FormLabel>
                <Input as="textarea" rows={5} value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Write your message here..." />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={handleSendEmail} isLoading={isSendingEmail} isDisabled={!emailSubject || !emailBody}>
                Send Email
              </Button>
              <Button onClick={closeEmailModal} variant="ghost">Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
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
