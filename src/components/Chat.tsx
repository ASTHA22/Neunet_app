import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  CloseButton,
  Button,
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
  SimpleGrid,
  Textarea,
  useToast,
  Divider,
  List,
  ListItem
} from '@chakra-ui/react';

// --- Helper to render job description as a card ---
function renderJobDescriptionCard(content: any) {
  if (!content) return null;
  return (
    <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" boxShadow="md" mt={2} mb={2}>
      <Text fontSize="xl" fontWeight="bold" mb={1}>{content.job_title || "Job Title"}</Text>
      <Text fontSize="md" color="purple.700" mb={1}>{content.company_name}</Text>
      <Text fontSize="sm" color="gray.600" mb={2}>{content.location}</Text>
      <Divider mb={2} />
      {content.about_the_role && (
        <>
          <Text fontWeight="semibold" mb={1}>About the Role</Text>
          <Text fontSize="sm" mb={2}>{content.about_the_role}</Text>
        </>
      )}
      {content.key_responsibilities && content.key_responsibilities.length > 0 && (
        <>
          <Text fontWeight="semibold" mb={1}>Key Responsibilities</Text>
          <List styleType="disc" pl={4} mb={2}>
            {content.key_responsibilities.map((item: string, idx: number) => (
              <ListItem key={idx}>{item}</ListItem>
            ))}
          </List>
        </>
      )}
      {content.qualifications && content.qualifications.length > 0 && (
        <>
          <Text fontWeight="semibold" mb={1}>Qualifications</Text>
          <List styleType="disc" pl={4} mb={2}>
            {content.qualifications.map((item: string, idx: number) => (
              <ListItem key={idx}>{item}</ListItem>
            ))}
          </List>
        </>
      )}
      {content.skills_and_competencies && content.skills_and_competencies.length > 0 && (
        <>
          <Text fontWeight="semibold" mb={1}>Skills & Competencies</Text>
          <List styleType="disc" pl={4} mb={2}>
            {content.skills_and_competencies.map((item: string, idx: number) => (
              <ListItem key={idx}>{item}</ListItem>
            ))}
          </List>
        </>
      )}
      {content.benefits && content.benefits.length > 0 && (
        <>
          <Text fontWeight="semibold" mb={1}>Benefits</Text>
          <List styleType="disc" pl={4} mb={2}>
            {content.benefits.map((item: string, idx: number) => (
              <ListItem key={idx}>{item}</ListItem>
            ))}
          </List>
        </>
      )}
      {content.about && content.about.more_about_the_company && (
        <>
          <Divider mb={2} />
          <Text fontWeight="semibold" mb={1}>About the Company</Text>
          <Text fontSize="sm">{content.about.more_about_the_company}</Text>
        </>
      )}
      <Divider mt={2} />
      <VStack align="start" spacing={1} mt={2}>
        <Text fontSize="xs" color="gray.500">Job Type: {content.job_type || "N/A"}</Text>
        <Text fontSize="xs" color="gray.500">Time Commitment: {content.time_commitment || "N/A"}</Text>
        <Text fontSize="xs" color="gray.500">Level: {content.job_level || "N/A"}</Text>
        <Text fontSize="xs" color="gray.500">Estimated Pay: {content.estimated_pay_range || "N/A"}</Text>
      </VStack>
    </Box>
  );
}

import { FiSend, FiUser, FiBriefcase, FiUsers, FiHelpCircle, FiInfo } from 'react-icons/fi';
import { useLocation, useParams } from 'react-router-dom';
import { AnimatedLogo } from './AnimatedLogo';
import { generateJobDescription, getCandidateById, getJobCandidates, sendEmail } from '../services/api';
import { JobFormData } from '../pages/CreateJob';

interface MessageContent {
  type: string;
  [key: string]: any;
}

import ReactMarkdown from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';

function getStatusColor(status: string) {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s.includes('shortlist')) return 'green';
  if (s.includes('reject')) return 'red';
  if (s.includes('applied')) return 'purple';
  return 'gray';
}

function renderChatMessage(content: string | MessageContent) {
  if (typeof content === 'string') {
    return <Text whiteSpace="pre-line">{content}</Text>;
  }
  if (!content || typeof content !== 'object') {
    return <Text color="red.500">[Invalid message format]</Text>;
  }
  // --- Match ChatPage: jobs_applied_cards ---
  if (content.type === 'jobs_applied_cards' && content.jobs) {
    return (
      <Box>
        <Text mb={2}>{content.message || 'Jobs applied:'}</Text>
        <VStack spacing={2} align="stretch">
          {content.jobs.map((job: any, idx: number) => (
            <Box key={idx} p={3} borderWidth="1px" borderRadius="md" bg="white">
              <Text fontWeight="bold">{job.title}</Text>
              <Text fontSize="sm">{job.company}</Text>
              <HStack justifyContent="space-between">
                <Text fontSize="xs" color="gray.500">Applied: {job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : 'N/A'}</Text>
                {job.status && <Badge colorScheme={getStatusColor(job.status)}>{job.status}</Badge>}
              </HStack>
              <HStack mt={2}><ChakraLink as={RouterLink} to={`/jobs/${job.id}`} color="purple.500" fontSize="xs">View Job</ChakraLink></HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }
  // --- Match ChatPage: topCandidates ---
  if (content.type === 'topCandidates' && content.candidates) {
    return (
      <Box>
        <Text mb={2}>{content.message || 'Top candidates:'}</Text>
        <VStack spacing={2} align="stretch">
          {content.candidates.map((candidate: any, idx: number) => {
            return (
              <Box key={idx} p={3} borderWidth="1px" borderRadius="md" bg="white">
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">{candidate.name}</Text>
                  <HStack spacing={1}>
                    {/* Social links can be added here if needed */}
                  </HStack>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Score: {
  (() => {
    let val: number | null = null;
    if (typeof candidate.ranking === 'number') {
      val = candidate.ranking > 1 ? Math.round(candidate.ranking) : Math.round(candidate.ranking * 100);
    } else if (typeof candidate.score === 'number') {
      val = candidate.score > 1 ? Math.round(candidate.score) : Math.round(candidate.score * 100);
    } else if (candidate.evaluation && typeof candidate.evaluation.total === 'number') {
      val = candidate.evaluation.total > 1 ? Math.round(candidate.evaluation.total) : Math.round(candidate.evaluation.total * 100);
    }
    return typeof val === 'number' ? `${val}%` : 'N/A';
  })()
}
                </Text>
                {candidate.status && <Badge colorScheme={getStatusColor(candidate.status)}>{candidate.status}</Badge>}
              </Box>
            );
          })}
        </VStack>
      </Box>
    );
  }
  if (content.type === 'text' && typeof content.content === 'string') {
    // Markdown support for text messages
    if (content.content && (content.content.includes('#') || content.content.includes('**') || content.content.includes('*'))) {
      return (
        <Box className="markdown-content">
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </Box>
      );
    }
    return <Text whiteSpace="pre-line">{content.content}</Text>;
  }
  // --- JOB DESCRIPTION CARD HANDLER ---
  if (content.type === 'job_description' && content.content) {
    return renderJobDescriptionCard(content.content);
  }
  return (
    <Text color="red.500">
      [Unsupported message format: {content.type || 'unknown'}]
      {JSON.stringify(content, null, 2)}
    </Text>
  );
}

interface Message {
  text: string | MessageContent;
  sender: string;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  onAIGeneratedJob?: (jobFields: Partial<JobFormData>) => void;
  candidateId?: string;
  jobId?: string;
  fullPage?: boolean; // Whether this is a full-page chat (for ChatPage) or a sidebar widget
}

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

const Chat = ({ isOpen, onClose, onAIGeneratedJob, candidateId: candidateIdProp, jobId: jobIdProp, fullPage = false }: ChatProps) => {
  const params = useParams<{ jobId?: string; candidateId?: string }>();
  const location = useLocation();
  let candidateId = candidateIdProp || params.candidateId;
  let jobId = jobIdProp || params.jobId;
  // Fallback: parse from pathname
  if (!candidateId || !jobId) {
    const ids = extractIdsFromPath(location.pathname);
    candidateId = candidateId || ids.candidateId;
    jobId = jobId || ids.jobId;
  }
  console.log('Chat context: candidateId:', candidateId, 'jobId:', jobId, 'params:', params, 'props:', { candidateIdProp, jobIdProp });

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const sessionId = React.useMemo(() => {
    let sid = window.localStorage.getItem('chatSessionId');
    if (!sid) {
      sid = 'user-' + Math.random().toString(36).slice(2);
      window.localStorage.setItem('chatSessionId', sid);
    }
    return sid;
  }, []);

  useEffect(() => {
    // Always use Render backend for WebSocket connection
    const socket = new WebSocket(`wss://neunet-ai-services.onrender.com/ws/chat/${sessionId}`);

    // Keepalive ping every 60 seconds
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 60000);

    // Register event handlers BEFORE the return!
    socket.onopen = () => {
      setWsConnected(true);
      console.log('[WS] Connected to backend chat for session', sessionId);
    };
    socket.onerror = (e) => {
      setWsConnected(false);
      console.error('[WS] Error:', e);
    };
    socket.onclose = (e) => {
      setWsConnected(false);
      console.warn('[WS] Closed:', e);
    };

    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      socket.close();
    };

    socket.onmessage = (event) => {
      console.log('[WS] Received message from backend:', event.data);
      try {
        // Try to parse as JSON first
        let content;
        try {
          content = JSON.parse(event.data);
          console.log('[WS] Successfully parsed JSON:', content);
        } catch (e) {
          // Not JSON, use as string
          content = { type: 'text', content: event.data };
          console.log('[WS] Using as text content:', content);
        }
        
        // Make sure we have a properly formatted message content
        if (typeof content === 'string') {
          content = { type: 'text', content: content };
        }
        
        // Filter out ping messages
        if (content.type === 'ping') return;
        
        setMessages(prev => [...prev, { text: content, sender: 'assistant' }]);
      } catch (error) {
        console.error('[WS] Error processing message:', error);
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Error processing message from assistant' }, sender: 'assistant' }]);
      }
    };
    setWs(socket);
    return () => {
      socket.close();
    };
  }, [sessionId]);

  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { isOpen: isEmailModalOpen, onOpen: openEmailModal, onClose: closeEmailModal } = useDisclosure();
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const toast = useToast();
  const isCreateJobPage = location.pathname === '/create-job';
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handler for AI Generate Job button
  function handleAIGenerateClick() {
    setMessages(prev => [...prev, { text: { type: 'text', content: 'Generating job description with AI...' }, sender: 'assistant' }]);
    // Pass empty object as jobData parameter to satisfy TypeScript
    generateJobDescription({}).then((jobFields) => {
      if (onAIGeneratedJob) onAIGeneratedJob(jobFields);
      setMessages(prev => [...prev, { text: { type: 'text', content: 'AI job description generated.' }, sender: 'assistant' }]);
    }).catch(() => {
      setMessages(prev => [...prev, { text: { type: 'text', content: 'Failed to generate job description with AI.' }, sender: 'assistant' }]);
    });
  }
  
  // Handler for quick action buttons
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'show_top_candidates':
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Showing top candidates...' }, sender: 'assistant' }]);
        if (jobId) {
          fetchTopCandidates(jobId, undefined, undefined).then(result => {
            setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
          });
        } else {
          setMessages(prev => [...prev, { text: { type: 'text', content: 'No job in context.' }, sender: 'assistant' }]);
        }
        break;
        
      case 'show_job_info':
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Showing job information...' }, sender: 'assistant' }]);
        // Implement job info fetching here
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Job information feature coming soon.' }, sender: 'assistant' }]);
        break;
        
      case 'show_jobs_applied':
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Showing jobs applied...' }, sender: 'assistant' }]);
        if (candidateId) {
          fetchJobsApplied(candidateId).then(result => {
            setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
          });
        } else {
          setMessages(prev => [...prev, { text: { type: 'text', content: 'No candidate in context.' }, sender: 'assistant' }]);
        }
        break;
        
      case 'show_candidate_info':
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Showing candidate information...' }, sender: 'assistant' }]);
        // Implement candidate info fetching here
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Candidate information feature coming soon.' }, sender: 'assistant' }]);
        break;
        
      case 'help_me':
        setMessages(prev => [...prev, { text: { type: 'text', content: 'How can I help you today? You can ask me about candidates, jobs, or any other recruitment-related questions.' }, sender: 'assistant' }]);
        break;
        
      case 'show_faq':
        setMessages(prev => [...prev, { text: { type: 'text', content: 'Here are some frequently asked questions:\n\n1. How do I create a new job?\n2. How do I view candidates for a job?\n3. How do I search for candidates?\n4. How do I contact a candidate?' }, sender: 'assistant' }]);
        break;
        
      default:
        break;
    }
  }

  const handleSend = () => {
    const msg = message.trim();
    if (!msg) return;

    // --- Extract jobId from message if present ---
    let extractedJobId: string | undefined = jobId;
    const jobIdMatch = msg.match(/job id[:\s]*([0-9]+)/i);
    if (jobIdMatch && jobIdMatch[1]) {
      extractedJobId = jobIdMatch[1];
    }

    if (msg.includes('show top candidates')) {
      setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: { type: 'text', content: 'Showing top candidates...' }, sender: 'assistant' }]);
      if (extractedJobId) {
        fetchTopCandidates(extractedJobId, undefined, undefined).then(result => {
          setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
        });
      } else {
        setMessages(prev => [...prev, { text: { type: 'text', content: 'No job in context.' }, sender: 'assistant' }]);
      }
      setMessage('');
      return;
    }
    // Support 'show top candidate' (no number, singular)
    if (msg.includes('top candidate')) {
      setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: { type: 'text', content: 'Showing top candidate...' }, sender: 'assistant' }]);
      if (extractedJobId) {
        fetchTopCandidates(extractedJobId, 1).then(result => {
          setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
        });
      } else {
        setMessages(prev => [...prev, { text: { type: 'text', content: 'No job in context.' }, sender: 'assistant' }]);
      }
      setMessage('');
      return;
    }
    // Support 'show top X% candidate(s)'
    const topPercentMatch = msg.match(/top (\d+)% candidates?/);
    if (topPercentMatch) {
      const percent = parseInt(topPercentMatch[1], 10);
      setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: { type: 'text', content: `Showing top ${percent}% candidate${percent === 1 ? '' : 's'}...` }, sender: 'assistant' }]);
      if (extractedJobId) {
        fetchTopCandidates(extractedJobId, undefined, percent / 100).then(result => {
          setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
        });
      } else if (candidateId) {
        fetchJobsApplied(candidateId).then((result) => {
          setMessages(prev => [...prev, { text: result, sender: 'assistant' }]);
        });
      } else {
        setMessages(prev => [...prev, { text: { type: 'text', content: 'No candidate in context.' }, sender: 'assistant' }]);
      }
      setMessage('');
      return;
    }
    if (msg.includes('send email')) {
      setMessages(prev => [...prev, { text: message, sender: 'user' }, { text: { type: 'text', content: 'Opening email composer for this candidate...' }, sender: 'assistant' }]);
      handleOpenEmailModal();
      setMessage('');
      return;
    }
    // WebSocket-based chat integration
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('[WS] Sending message to backend:', message);
      setMessages(prev => [...prev, { text: { type: 'text', content: message }, sender: 'user' }]);
      ws.send(JSON.stringify({ type: 'text', content: message }));
      setMessage('');
      return;
    } else {
      console.error('[WS] WebSocket not connected, cannot send message');
      setMessages(prev => [...prev, 
        { text: { type: 'text', content: message }, sender: 'user' },
        { text: { type: 'text', content: 'Error: Not connected to chat server. Please try again later.' }, sender: 'assistant' }
      ]);
      setMessage('');
      return;
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

  const handleOpenEmailModal = () => {
    openEmailModal();
  };

  const handleSendEmail = () => {
    setIsSendingEmail(true);
    sendEmail(emailTo, emailSubject, emailBody).then(() => {
      toast({
        title: 'Email sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      closeEmailModal();
    }).catch((error) => {
      toast({
        title: 'Error sending email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }).finally(() => {
      setIsSendingEmail(false);
    });
  };

  const fetchTopCandidates = async (jobId: string, limit?: number, percent?: number) => {
    try {
      const candidates = await getJobCandidates(jobId);
      if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
        return { type: 'text', content: 'No candidates found for this job.' };
      }
      // Optionally sort/rank candidates (assuming candidates have a ranking field)
      let sorted = [...candidates];
      if (percent) {
        const count = Math.ceil(sorted.length * percent);
        sorted = sorted.slice(0, count);
      } else if (limit) {
        sorted = sorted.slice(0, limit);
      }
      return {
        type: 'topCandidates',
        candidates: sorted.map((c: any, idx: number) => ({
          ...c,
          idx,
          ranking: c.ranking || idx + 1,
          status: c.status || 'applied',
        })),
      };
    } catch (err) {
      return { type: 'text', content: 'Error fetching candidates.' };
    }
  };

  const fetchJobsApplied = async (candidateId: string) => {
    try {
      const candidate = await getCandidateById(candidateId);
      if (!candidate || !candidate.jobsApplied || candidate.jobsApplied.length === 0) {
        return { type: 'text', content: 'No jobs found for this candidate.' };
      }
      // Sort jobs by appliedAt (if available)
      const jobs = [...candidate.jobsApplied].sort((a, b) => {
        if (!a.appliedAt || !b.appliedAt) return 0;
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      });
      return {
        type: 'jobs_applied_cards',
        jobs,
      };
    } catch (err) {
      return { type: 'text', content: 'Error fetching jobs applied.' };
    }
  };

  const sendEmail = async (to: string, subject: string, body: string) => {
    // implement sendEmail logic here
  };

  // Determine the container styling based on whether this is full-page or sidebar
  const containerProps = fullPage ? {
    // Full-page mode
    position: "relative" as const,
    height: "100%",
    width: "100%",
    bg: "white",
    borderRadius: "lg",
    boxShadow: "sm",
    display: "flex" as const,
    flexDirection: "column" as const,
  } : {
    // Sidebar widget mode
    position: "fixed" as const,
    top: 0,
    right: 0,
    height: "100vh",
    width: "30%",
    bg: "white",
    boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)",
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: "transform 0.3s ease-in-out",
    zIndex: 1000,
    display: "flex" as const,
    flexDirection: "column" as const,
  };

  return (
    <Box {...containerProps}>
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.100">
        <HStack spacing={3} align="center">
          <AnimatedLogo size={20} />
          <Text fontSize="lg" fontWeight="medium">Robin</Text>
          <Box flex={1} />
          {!fullPage && <CloseButton onClick={handleClose} />}
        </HStack>
      </Box>

      {/* Title */}
      <Box py={6}>
        <Text fontSize="2xl" fontWeight="medium" textAlign="center">How can I help you today?</Text>
      </Box>

      {/* Content Area */}
      <Box flex={1} overflowY="auto" display="flex" flexDirection="column" alignItems="center">
        {/* On /create-job, show AI button, else context-aware quick actions */}
        {isCreateJobPage ? (
          <Button onClick={handleAIGenerateClick} colorScheme="purple" mb={4}>
            Generate Job Description with AI
          </Button>
        ) : (
          <Box mb={4} width="100%" px={4}>
            <SimpleGrid columns={1} spacing={3} width="100%">
              {/* Show candidate-specific actions if we have a candidateId */}
              {candidateId ? (
                <>
                  <Button onClick={() => handleQuickAction('show_jobs_applied')} colorScheme="blue" variant="outline" justifyContent="flex-start" leftIcon={<FiBriefcase />}>
                    Show jobs applied
                  </Button>
                  <Button onClick={() => handleQuickAction('show_candidate_info')} colorScheme="green" variant="outline" justifyContent="flex-start" leftIcon={<FiUser />}>
                    Show candidate info
                  </Button>
                </>
              ) : location.pathname.includes('/job/') ? (
                <>
                  <Button onClick={() => handleQuickAction('show_top_candidates')} colorScheme="purple" variant="outline" justifyContent="flex-start" leftIcon={<FiUsers />}>
                    Show top candidates
                  </Button>
                  <Button onClick={() => handleQuickAction('show_job_info')} colorScheme="blue" variant="outline" justifyContent="flex-start" leftIcon={<FiBriefcase />}>
                    Show job info
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => handleQuickAction('help_me')} colorScheme="purple" variant="outline" justifyContent="flex-start" leftIcon={<FiHelpCircle />}>
                    Help me with something
                  </Button>
                  <Button onClick={() => handleQuickAction('show_faq')} colorScheme="blue" variant="outline" justifyContent="flex-start" leftIcon={<FiInfo />}>
                    Show FAQ
                  </Button>
                </>
              )}
            </SimpleGrid>
          </Box>
        )}


        {/* Messages */}
        <VStack spacing={4} align="stretch" width="100%">
          {messages.map((msg, idx) => (
            <Box key={idx} alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'} bg={msg.sender === 'user' ? 'purple.50' : 'gray.50'} p={3} borderRadius="md" maxWidth="80%">
              {renderChatMessage(msg.text)}
            </Box>
          ))}
          <div ref={chatBottomRef} />
        </VStack>
      </Box>

      {/* Input Area */}
      <Box p={4} borderTop="1px" borderColor="gray.100">
        <HStack>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            flex={1}
          />
          <IconButton
            aria-label="Send"
            icon={<FiSend />}
            colorScheme="purple"
            onClick={handleSend}
            isDisabled={!message.trim()}
          />
        </HStack>
      </Box>

      {/* Email Modal */}
      <Modal isOpen={isEmailModalOpen} onClose={closeEmailModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Email</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>To</FormLabel>
              <Input value={emailTo} onChange={e => setEmailTo(e.target.value)} isDisabled />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Subject</FormLabel>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Body</FormLabel>
              <Input value={emailBody} onChange={e => setEmailBody(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={handleSendEmail} isLoading={isSendingEmail} isDisabled={!emailSubject || !emailBody}>
              Send
            </Button>
            <Button variant="ghost" onClick={closeEmailModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Chat;