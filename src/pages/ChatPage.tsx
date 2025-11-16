import { Box, Container, Input, Text, SimpleGrid, Icon, Link as ChakraLink, HStack, IconButton, VStack, Badge, Spinner, Tooltip, Button } from '@chakra-ui/react'
import { FiMessageSquare, FiSend, FiUsers, FiEdit3, FiHelpCircle, FiBriefcase, FiHome, FiAlertCircle, FiLinkedin, FiGithub, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { AnimatedLogo } from '../components/AnimatedLogo'
import { PostLoginQuickActions } from '../components/PostLoginQuickActions'
import React from 'react';

// --- Helper to render job description as a card ---
function renderJobDescriptionCard(jd: any) {
  if (!jd) return null;
  return (
    <Box p={4} borderRadius="md" bg="blue.50" borderWidth={1} borderColor="blue.200" mb={2}>
      <Text fontWeight="bold" fontSize="lg" mb={1}>{jd.job_title || 'Job Title'}</Text>
      <Text fontSize="md" mb={1}><b>Company:</b> {jd.company_name}</Text>
      <Text fontSize="sm" mb={2}><b>Location:</b> {jd.location}</Text>
      {jd.about_the_role && <Text mb={2}><b>About the Role:</b> {jd.about_the_role}</Text>}
      {jd.key_responsibilities && (
        <Box mb={2}>
          <Text fontWeight="semibold">Key Responsibilities:</Text>
          <ul style={{ marginLeft: 16 }}>
            {jd.key_responsibilities.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ul>
        </Box>
      )}
      {jd.qualifications && (
        <Box mb={2}>
          <Text fontWeight="semibold">Qualifications:</Text>
          <ul style={{ marginLeft: 16 }}>
            {jd.qualifications.map((q: string, i: number) => <li key={i}>{q}</li>)}
          </ul>
        </Box>
      )}
      {jd.skills_and_competencies && (
        <Box mb={2}>
          <Text fontWeight="semibold">Skills & Competencies:</Text>
          <ul style={{ marginLeft: 16 }}>
            {jd.skills_and_competencies.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ul>
        </Box>
      )}
      {jd.benefits && (
        <Box mb={2}>
          <Text fontWeight="semibold">Benefits:</Text>
          <ul style={{ marginLeft: 16 }}>
            {jd.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
          </ul>
        </Box>
      )}
    </Box>
  );
}

// --- Helper to render any message content, including job descriptions ---
function renderMessageContent(message: any) {
  console.log('[DEBUG] renderMessageContent received:', message);
  // Robustly detect job_description messages even if extra fields exist
  if (
    message &&
    typeof message === 'object' &&
    message.type &&
    message.type.toLowerCase().trim() === 'job_description' &&
    message.content &&
    typeof message.content === 'object'
  ) {
    return renderJobDescriptionCard(message.content);
  }
  if (message && message.type && message.type.toLowerCase().trim() === 'text') {
    return <Text>{message.content}</Text>;
  }
  // fallback: show as JSON
  console.log('[DEBUG] Fallback triggered for message:', message);
  return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'red', fontWeight: 'bold' }}>[FALLBACK] {JSON.stringify(message, null, 2)}</pre>;
}

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

// Define component message types
interface Message {
  text: any;
  sender: 'user' | 'assistant' | 'system';
}

// Define message content types
interface TextContent {
  type: 'text';
  content: string;
}

interface JobsAppliedContent {
  type: 'jobs_applied_cards';
  jobs: any[];
  message?: string;
  candidateId?: string;
}

interface TopCandidatesContent {
  type: 'topCandidates';
  candidates: any[];
  message?: string;
}

type MessageContent = TextContent | JobsAppliedContent | TopCandidatesContent;

export const ChatPage = () => {
  const location = useLocation();
  // Extract candidateId from URL params for context in chat messages
  const { candidateId } = useParams<{ candidateId?: string }>();
  
  // Log candidate context on component mount for debugging
  useEffect(() => {
    if (candidateId) {
      console.log(`[Init] Using candidateId: ${candidateId} for chat context`);
    } else {
      console.log('[Init] No candidateId in URL params, chat will use global context');
    }
  }, [candidateId]);

  // State for WebSocket connection and messages
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const maxReconnectAttempts = 5; // Maximum reconnect attempts
  const [pendingMessages, setPendingMessages] = useState<{text: string, context: any}[]>([]); // Queue for messages that failed to send
  const [lastPongReceived, setLastPongReceived] = useState<number | null>(null);
  const [multiagentStatus, setMultiagentStatus] = useState<'operational' | 'maintenance'>('maintenance'); // Default to maintenance based on logs
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [connectionStats, setConnectionStats] = useState<{
    pingCount: number;
    pongCount: number;
    messagesSent: number;
    messagesReceived: number;
    reconnectAttempts: number;
    lastReconnectTime: number | null;
  }>({ 
    pingCount: 0, 
    pongCount: 0, 
    messagesSent: 0, 
    messagesReceived: 0, 
    reconnectAttempts: 0,
    lastReconnectTime: null
  });
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const [sessionId, setSessionId] = useState<string>(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) return savedSessionId;
    const newSessionId = `user-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('chatSessionId', newSessionId);
    return newSessionId;
  });

  const connectionAttemptsRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupWebSocketResources = () => {
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
          console.log('[WS] WebSocket connection closed');
        }
      } catch (err) {
        console.error('[WS] Error closing WebSocket:', err);
      }
      wsRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  };

  // Initialize WebSocket connection when component mounts or sessionId changes
  useEffect(() => {
    console.log("[WS] Initializing WebSocket connection with sessionId:", sessionId);
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      console.log("[WS] Component unmounting, cleaning up WebSocket resources");
      cleanupWebSocketResources();
    };
  }, [sessionId]);
  
  // Effect to scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);
  
  // Set socket state when it's created
  useEffect(() => {
    if (wsRef.current) {
      setSocket(wsRef.current);
    }
  }, [wsRef.current]);
  
  const connectWebSocket = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    setConnectionStatus('connecting');
    setConnectionError(null);
    
    // Clean up any existing connection
    cleanupWebSocketResources();

    console.log(`[WS] Attempting connection #${reconnectAttempt}`);

    // Determine WebSocket URL based on current protocol
    // Always use Render backend for WebSocket connection in production
    const wsUrl = `wss://api.neunet.io/ws/chat/${sessionId}${candidateId && candidateId.trim() ? `?candidateId=${candidateId}` : ''}`;
    console.log(`[WS] Using WebSocket URL: ${wsUrl} with candidateId: ${candidateId || 'none'}`);
    console.log(`[WS] Connecting to ${wsUrl}`);

    const newSocket = new WebSocket(wsUrl);
    wsRef.current = newSocket;
    
    let connectionTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      console.log("[WS] Connection timeout after 10 seconds");
      if (newSocket.readyState !== WebSocket.OPEN) {
        newSocket.close();
        setConnectionStatus('error');
        setConnectionError("Connection timeout. Server may be unavailable.");
      }
    }, 10000); // 10 second connection timeout

    newSocket.onopen = () => {
      console.log("[WS] Connection established");
      setSocket(newSocket); // Set socket state immediately
      setWsConnected(true);
      setConnectionStatus('connected');
      setConnectionError(null);
      setReconnectAttempt(0); // Reset reconnect attempts on successful connection
      
      // Clear connection timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }

      // Set up ping interval to keep connection alive
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      pingIntervalRef.current = setInterval(() => {
        if (newSocket.readyState === WebSocket.OPEN) {
          try {
            newSocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            setConnectionStats(prev => ({ ...prev, pingCount: prev.pingCount + 1 }));
          } catch (error) {
            console.error("[WS] Error sending ping:", error);
          }
        }
      }, 30000); // Send ping every 30 seconds
      
      // Send any pending messages
      if (pendingMessages.length > 0) {
        console.log(`[WS] Sending ${pendingMessages.length} pending messages`);
        
        // Add a system message indicating reconnection
        setMessages(prev => [...prev, { 
          text: { type: 'text', content: `Reconnected. Sending ${pendingMessages.length} queued message(s)...` }, 
          sender: 'system' 
        }]);
        
        // Send each pending message
        pendingMessages.forEach(msg => {
          try {
            console.log("[WS] Sending pending message:", msg);
            newSocket.send(JSON.stringify(msg));
            setConnectionStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
          } catch (error) {
            console.error("[WS] Error sending pending message:", error);
          }
        });
        
        // Clear the pending messages queue
        setPendingMessages([]);
      }
    };
    
    newSocket.onmessage = (event) => {
      console.log("[WS] Received message:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("[WS] Parsed message data:", data);
        
        // Handle ping/pong messages
        if (data.type === 'ping') {
          console.log("[WS] Received ping, sending pong");
          newSocket.send(JSON.stringify({type: 'pong', timestamp: Date.now()}));
          setLastPongReceived(Date.now());
          return;
        }
        
        if (data.type === 'pong') {
          console.log("[WS] Received pong");
          setLastPongReceived(Date.now());
          setConnectionStats(prev => ({ ...prev, pongCount: prev.pongCount + 1 }));
          return;
        }
        
        // Add message to chat - ensure we're handling the response correctly
        // Only add non-system messages to the chat
        if (data.type !== 'ping' && data.type !== 'pong') {
          // Handle job description object separately
          if (data.type === 'job_description' && typeof data.content === 'object' && data.content !== null) {
            // Here you can autofill job form fields or show a job preview
            // Example: autofillJobForm(data.content); // implement this as needed
            setMultiagentStatus('operational');
          } else if (data.content && typeof data.content === 'string') {
            // Check if this is a maintenance message
            if (
              data.content.includes('AI processing queue is currently being fixed') ||
              data.content.includes('being updated') ||
              data.content.includes('could not be loaded')
            ) {
              setMultiagentStatus('maintenance');
            } else if (!data.content.includes('Connected to chat server')) {
              // If we get a real response, set status to operational
              setMultiagentStatus('operational');
            }
          }

          setMessages(prev => [...prev, { 
            text: data, 
            sender: 'assistant' 
          }]);
        }
        setConnectionStats(prev => ({ ...prev, messagesReceived: prev.messagesReceived + 1 }));
        
        // Log candidate data for debugging LinkedIn/GitHub links
        if (data.type === 'topCandidates' && data.candidates) {
          console.log("[WS] Received candidates with social links:");
          data.candidates.forEach((candidate: any, idx: number) => {
            console.log(`Candidate ${idx + 1} (${candidate.name}):`, 
              "LinkedIn:", candidate.resume?.contact?.linkedin || 'None',
              "GitHub:", candidate.resume?.contact?.github || 'None'
            );
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("[WS] Error parsing message:", error);
        setMessages(prev => [...prev, { 
          text: { type: 'text', content: 'Error processing server response.' }, 
          sender: 'system' 
        }]);
        setIsLoading(false);
      }
    };
    
    newSocket.onerror = (event) => {
      console.log("[WS] WebSocket error:", event);
      setSocket(null); // Clear socket state on error
      setConnectionStatus('error');
      setConnectionError("Connection error. Please try again later.");
      setIsLoading(false);
      
      // Clear connection timeout if it exists
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
    };

    newSocket.onclose = (event) => {
      console.log("[WS] Connection closed", event.code, event.reason);
      setSocket(null); // Clear socket state
      setWsConnected(false);
      setIsLoading(false);
      
      if (connectionStatus !== 'error') {
        setConnectionStatus('disconnected');
      }
      
      cleanupWebSocketResources();
      
      // Clear connection timeout if it exists
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }

      // Don't reconnect on normal closure
      if (event.code === 1000) {
        console.log("[WS] Normal closure");
        return;
      }

      // Attempt reconnection with exponential backoff
      if (reconnectAttempt < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempt), 15000); // Exponential backoff with max of 15 seconds
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempt + 1} of ${maxReconnectAttempts})`);
        
        // Show reconnection attempt in chat
        if (pendingMessages.length > 0) {
          setMessages(prev => [...prev, { 
            text: { type: 'text', content: `Connection lost. Reconnecting in ${delay/1000} seconds... (${pendingMessages.length} message(s) queued)` }, 
            sender: 'system' 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            text: { type: 'text', content: `Connection lost. Reconnecting in ${delay/1000} seconds...` }, 
            sender: 'system' 
          }]);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          setConnectionStats(prev => ({
            ...prev,
            reconnectAttempts: prev.reconnectAttempts + 1,
            lastReconnectTime: Date.now()
          }));
          connectWebSocket();
        }, delay);
      } else {
        console.log("[WS] Max reconnect attempts reached");
        setConnectionError("Could not establish a stable connection. Please refresh the page.");
        
        // Show max reconnect attempts reached in chat
        setMessages(prev => [...prev, { 
          text: { type: 'text', content: `Failed to reconnect after ${maxReconnectAttempts} attempts. Please refresh the page.` }, 
          sender: 'system' 
        }]);
      }
    };
  };

  // Forward declaration for connectWebSocket (actual implementation is below)
  // This is needed because sendMessage references connectWebSocket
  
  // Function to send a message via WebSocket
  const sendMessage = (text?: string) => {
    // Don't send empty messages
    const messageText = text || inputValue;
    if (!messageText.trim()) return;
    
    // Clear input field if sending from input
    if (!text) {
      setInputValue('');
    }
    
    // Log candidate context for debugging
    console.log(`[Send] Sending message with candidateId context: ${candidateId || 'none'}`);
    
    // Add user message to chat
    const userMessage = { text: messageText, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    // Check if WebSocket is connected
    if (!socket || !wsConnected) {
      console.log("[WS] Cannot send message, socket not connected");
      // Queue the message to be sent when connection is established
      const contextToQueue = candidateId && candidateId.trim() ? { candidateId } : {};
      const messageToQueue = { text: messageText, context: contextToQueue };
      console.log(`[WS] Queuing message: ${JSON.stringify(messageToQueue)}`);
      setPendingMessages(prev => [...prev, messageToQueue]);
      
      // Add system message about connection status
      setMessages(prev => [...prev, { 
        text: { type: 'text', content: 'Connecting to server... Your message will be sent when connection is established.' }, 
        sender: 'system' as const 
      }]);
      
      // Try to reconnect
      connectWebSocket();
      return;
    }
    
    // Send message via WebSocket
    try {
      // Only include candidateId in context if it exists and is not empty
      const context = candidateId && candidateId.trim() ? { candidateId } : {};
      console.log("[WS] Sending message:", { text: messageText, context });
      socket.send(JSON.stringify({ text: messageText, context }));
      setConnectionStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
    } catch (error) {
      console.error('[WS] Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: { type: 'text', content: 'Error sending message. Please try again.' }, 
        sender: 'system' as const 
      }]);
      setIsLoading(false);
    }
  };
  
  // Define quick actions - using sendMessage directly
  const quickActions = [
    { label: 'Show top candidates', icon: FiUsers, action: () => {
      console.log('[Action] Show top candidates clicked');
      sendMessage('show top candidates');
    }},
    { label: 'Show jobs applied', icon: FiBriefcase, action: () => {
      console.log('[Action] Show jobs applied clicked');
      // This action specifically needs the candidateId context from the current route
      // to show the correct jobs applied for the current candidate
      sendMessage('show jobs applied');
    }},
    { label: 'Summarize candidate', icon: FiEdit3, action: () => {
      console.log('[Action] Summarize candidate clicked');
      sendMessage('summarize candidate');
    }},
    { label: 'Help', icon: FiHelpCircle, action: () => {
      console.log('[Action] Help clicked');
      sendMessage('help');
    }},
  ];

  const renderMessageContent = (message: any) => {
    // Handle case where message is directly passed instead of Message object
    if (!message) return <Text>No message content</Text>;
    
    // If message is already a string, just return it
    if (typeof message === 'string') return <Text>{message}</Text>;
    
    // If message is a Message object with text property
    const text = message.text || message;
    
    // Handle string text
    if (typeof text === 'string') return <Text>{text}</Text>;
    
    // Handle object with type property
    if (text && text.type === 'text') {
      // Check if content contains markdown formatting
      if (text.content && (text.content.includes('#') || text.content.includes('**') || text.content.includes('*'))) {
        return (
          <Box className="markdown-content">
            <ReactMarkdown>{text.content}</ReactMarkdown>
          </Box>
        );
      }
      return <Text whiteSpace="pre-wrap">{text.content}</Text>;
    }
    
    if (text && text.type === 'jobs_applied_cards' && text.jobs) {
      return (
        <Box>
          {/* Display custom message if provided, otherwise use default */}
          <Text mb={2}>{text.message || 'Jobs applied:'}</Text>
          <VStack spacing={2} align="stretch">
            {text.jobs.map((job: any, idx: number) => (
              <Box key={idx} p={3} borderWidth="1px" borderRadius="md" bg="white">
                <Text fontWeight="bold">{job.title}</Text>
                <Text fontSize="sm">{job.company}</Text>
                <HStack justifyContent="space-between">
                  <Text fontSize="xs" color="gray.500">Applied: {new Date(job.appliedAt).toLocaleDateString()}</Text>
                  {job.status && <Badge colorScheme={getStatusColor(job.status)}>{job.status}</Badge>}
                </HStack>
                <HStack mt={2}><ChakraLink as={Link} to={`/jobs/${job.id}`} color="purple.500" fontSize="xs">View Job</ChakraLink></HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      );
    }

    // --- JOB DESCRIPTION CARD HANDLER ---
    if (text && text.type === 'job_description' && text.content) {
      return renderJobDescriptionCard(text.content);
    }

    if (text && text.type === 'topCandidates' && text.candidates) {
      console.log("[Render] Rendering topCandidates with", text.candidates.length, "candidates");
      return (
        <Box>
          <Text mb={2}>{text.message || 'Top candidates:'}</Text>
          <VStack spacing={2} align="stretch">
            {text.candidates.map((candidate: any, idx: number) => {
              // Log each candidate's social links for debugging
              console.log(`[Render] Candidate ${idx + 1} (${candidate.name}):`, 
                "LinkedIn:", candidate.resume?.contact?.linkedin || 'None',
                "GitHub:", candidate.resume?.contact?.github || 'None'
              );
              
              return (
                <Box key={idx} p={3} borderWidth="1px" borderRadius="md" bg="white">
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold">{candidate.name}</Text>
                    <HStack spacing={1}>
                      {candidate.resume?.contact?.linkedin && (
                        <Tooltip label="LinkedIn">
                          <IconButton 
                            aria-label="LinkedIn" 
                            as="a" 
                            href={candidate.resume.contact.linkedin} 
                            target="_blank" 
                            icon={<FiLinkedin />} 
                            size="xs" 
                            variant="ghost" 
                          />
                        </Tooltip>
                      )}
                      {candidate.resume?.contact?.github && (
                        <Tooltip label="GitHub">
                          <IconButton 
                            aria-label="GitHub" 
                            as="a" 
                            href={candidate.resume.contact.github} 
                            target="_blank" 
                            icon={<FiGithub />} 
                            size="xs" 
                            variant="ghost" 
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </HStack>
                  {/* Show Score: prefer candidate.ranking, fallback to score or evaluation.total, normalized to 0-100. */}
<Text fontSize="sm" color="gray.500">
  Score: {
    (() => {
      let val = null;
      if (typeof candidate.ranking === 'number') {
        val = candidate.ranking > 1 ? Math.round(candidate.ranking) : Math.round(candidate.ranking * 100);
      } else if (typeof candidate.score === 'number') {
        val = candidate.score > 1 ? Math.round(candidate.score) : Math.round(candidate.score * 100);
      } else if (candidate.evaluation && typeof candidate.evaluation.total === 'number') {
        val = candidate.evaluation.total > 1 ? Math.round(candidate.evaluation.total) : Math.round(candidate.evaluation.total * 100);
      }
      return val !== null ? `${val}%` : 'N/A';
    })()
  }
</Text>
                  {/* Always use canonical candidate_id-based URLs. Never use email or legacy id in URL. */}
<HStack mt={2}>
  {candidate.candidate_id && candidate.job_id ? (
    <ChakraLink as={Link} to={`/job-candidates/${candidate.job_id}/candidate/${candidate.candidate_id}`} color="purple.500" fontSize="xs">
      View Profile
    </ChakraLink>
  ) : (
    <Tooltip label="Invalid candidate profile">
      <span style={{ color: 'gray', fontSize: 'xs', cursor: 'not-allowed' }}>View Profile</span>
    </Tooltip>
  )}
</HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>
      );
    }
    
    try {
      // If we got here, text might be an object without a recognized type
      // or it might be undefined/null
      if (!text) {
        return <Text>No message content available</Text>;
      }
      // Safely stringify the message content
      return <Text whiteSpace="pre-wrap">{JSON.stringify(text || {}, null, 2)}</Text>;
    } catch (e) {
      console.error('Error rendering message:', e);
      return <Text>Unable to display message content</Text>;
    }
  };
  
  // Helper function to determine badge color based on job status
  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('interview')) return 'green';
    if (statusLower.includes('review')) return 'blue';
    if (statusLower.includes('received')) return 'purple';
    if (statusLower.includes('rejected')) return 'red';
    if (statusLower.includes('offer')) return 'teal';
    return 'gray';
  };

  // Add CSS for markdown content
  const markdownStyles = {
    '.markdown-content': {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: 'rgba(247, 250, 252, 0.8)',
    },
    '.markdown-content h3': {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: 'purple.700',
    },
    '.markdown-content strong': {
      fontWeight: 'bold',
      color: 'gray.700',
    },
    '.markdown-content ul': {
      paddingLeft: '20px',
      marginBottom: '8px',
    },
    '.markdown-content li': {
      marginBottom: '4px',
    }
  };

  return (
    <Container maxW="container.xl" p={0} h="100vh" display="flex" flexDirection="column">
      <Box flex={1} display="flex" flexDirection="column" bg="gray.50" sx={markdownStyles}>
        <HStack p={4} bg="white" borderBottom="1px" borderColor="gray.100" justifyContent="space-between">
          <HStack spacing={3}>
            <AnimatedLogo size={24} />
            <Text fontSize="lg" fontWeight="bold">Neunet Assistant</Text>
          </HStack>
          <HStack>
            <Badge colorScheme={
                connectionStatus === 'connected' ? 'green' : 
                connectionStatus === 'connecting' ? 'yellow' : 
                connectionStatus === 'error' ? 'red' : 'gray'
              }>
                {connectionStatus.toUpperCase()}
            </Badge>
            {connectionError && (
              <Tooltip label={connectionError}>
                <Badge colorScheme="red" onClick={() => setConnectionError(null)} cursor="pointer">
                  CLEAR ERROR
                </Badge>
              </Tooltip>
            )}
            <Tooltip label="Diagnostics">
              <IconButton
                icon={<FiActivity />}
                aria-label="Toggle Diagnostics"
                variant="ghost"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              />
            </Tooltip>
            <Tooltip label="Dashboard">
              <IconButton as={Link} to="/dashboard" icon={<FiHome />} aria-label="Dashboard" variant="ghost" />
            </Tooltip>
          </HStack>
        </HStack>

        {connectionError && (
          <HStack bg="red.100" p={3} justifyContent="center">
            <Icon as={FiAlertCircle} color="red.500" />
            <Text fontSize="sm" color="red.700">{connectionError}</Text>
          </HStack>
        )}
        
        {multiagentStatus === 'maintenance' && (
          <HStack bg="yellow.100" p={3} justifyContent="center" borderBottom="1px" borderColor="yellow.300">
            <Icon as={FiAlertTriangle} color="yellow.600" />
            <Text fontSize="sm" color="yellow.800">The AI system is currently undergoing maintenance. Basic responses are available, but advanced features may be limited.</Text>
          </HStack>
        )}

        <Box flex={1} p={4} overflowY="auto" display="flex" flexDirection="column">
          {showDiagnostics && (
            <Box 
              width="100%" 
              bg="gray.100" 
              p={3} 
              borderRadius="md" 
              mb={4} 
              fontSize="sm"
              position="relative"
            >
              <Text fontWeight="bold" mb={2}>WebSocket Diagnostics</Text>
              <Button 
                size="xs" 
                position="absolute" 
                top={2} 
                right={2} 
                onClick={() => setShowDiagnostics(false)}
              >
                Close
              </Button>
              <VStack align="start" spacing={1}>
                <Text>
                  Status: {
                    connectionStatus === 'connected' ? '🟢 Connected' : 
                    connectionStatus === 'connecting' ? '🟡 Connecting' : 
                    connectionStatus === 'error' ? '🔴 Error' : '⚫ Disconnected'
                  }
                </Text>
                {connectionError && <Text color="red.500">Error: {connectionError}</Text>}
                <Text>Session ID: {sessionId}</Text>
                <Text>Ping/Pong: {connectionStats.pingCount}/{connectionStats.pongCount}</Text>
                <Text>Messages Sent/Received: {connectionStats.messagesSent}/{connectionStats.messagesReceived}</Text>
                <Text>Reconnect Attempts: {connectionStats.reconnectAttempts}</Text>
                {connectionStats.lastReconnectTime && (
                  <Text>Last Reconnect: {new Date(connectionStats.lastReconnectTime).toLocaleTimeString()}</Text>
                )}
                <HStack mt={2} spacing={2}>
                  <Button size="sm" colorScheme="blue" variant="outline" onClick={() => sendMessage('test connection')}>Test Connection</Button>
                  <Button 
                    size="xs" 
                    onClick={() => {
                      setConnectionStats({
                        pingCount: 0,
                        pongCount: 0,
                        messagesSent: 0,
                        messagesReceived: 0,
                        reconnectAttempts: 0,
                        lastReconnectTime: null
                      });
                    }}
                  >
                    Reset Stats
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}
          
          {messages.length === 0 ? (
            <VStack spacing={8} justify="center" h="full">
              <Text fontSize="xl" color="gray.500">How can I help you today?</Text>
              <PostLoginQuickActions onAction={sendMessage} />
            </VStack>
          ) : (
            <Box position="relative" pb="70px" pt="20px" px={4} flex="1" overflowY="auto" bg="gray.50">
              {messages.map((message, index) => (
                <Box 
                  key={index} 
                  mb={4} 
                  p={3} 
                  borderRadius="lg" 
                  maxW="80%" 
                  bg={message.sender === 'user' ? 'purple.100' : message.sender === 'system' ? 'gray.100' : 'white'}
                  alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                  ml={message.sender === 'user' ? 'auto' : 0}
                  borderWidth={1}
                >
                  {message.sender === 'user'
                    ? (<Text>{typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}</Text>)
                    : (() => { console.log('[DEBUG] render loop assistant message.text:', message.text); return renderMessageContent(message.text); })()
                  }
                </Box>
              ))}
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box p={4} borderTop="1px" borderColor="gray.100">
          <Box position="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              size="lg"
              pr="3rem"
              disabled={!wsConnected || isLoading}
              aria-label="Chat input field"
            />
            <IconButton
              icon={isLoading ? <Spinner size="xs" /> : <FiSend />}
              aria-label="Send message"
              position="absolute"
              right="0.5rem"
              top="50%"
              transform="translateY(-50%)"
              size="sm"
              bg="#9C6CFE"
              color="white"
              cursor="pointer"
              _hover={{ bg: '#8A5EE3', cursor: 'pointer' }}
              _disabled={{ 
                bg: 'gray.300', 
                color: 'gray.500',
                cursor: 'not-allowed',
                opacity: 0.6
              }}
              onClick={() => sendMessage()}
              isDisabled={!inputValue.trim() || isLoading}
            />
          </Box>
          
          {/* Quick action buttons */}
          {messages.length > 0 && (
            <HStack mt={2} spacing={2} overflowX="auto" py={2}>
              {quickActions.map((action, idx) => (
                <IconButton 
                  key={idx} 
                  aria-label={action.label} 
                  icon={<Icon as={action.icon} />} 
                  onClick={action.action} 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="purple" 
                  title={action.label} 
                  isDisabled={isLoading} 
                />
              ))}
            </HStack>
          )}
        </Box>
      </Box>
    </Container>
  );
};

// Using named export instead of default export