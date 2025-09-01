import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  HStack,
  Avatar,
  Icon,
  Flex,
  Select,
  Divider,
  IconButton,
  Grid,
  GridItem,
  Card,
  CardBody,
  Badge,
  VStack,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import { FiArrowLeft, FiGithub, FiDownload } from 'react-icons/fi'
import { SiLinkedin } from 'react-icons/si'
import { Link as RouterLink, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchJobById, getJobCandidates, getCandidateResume, updateCandidateStatus } from '../services/api'
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Tooltip } from '@chakra-ui/react'
import { Job } from '../types/job'

import { ResumeData } from '../types/resume';
import { ChatWidget } from '../components/ChatWidget';

interface Candidate {
  candidate_id?: string; // Unique candidate identifier
  name: string;
  email: string;
  ranking?: number; // Make optional
  status: string;
  applied_at: string;
  cover_letter?: string;
  resume?: ResumeData | any; // parsed resume JSON
  resume_blob_name?: string; // Azure Blob Storage filename
}

interface CandidateCardProps {
  jobId: string;
  candidate: Candidate;
  reloadCandidates: () => void;
}

// Utility: Clamp and convert ranking to percentage (0-100%)
function normalizeRanking(ranking: number): number {
  // Accept floats between 0 and 1; if backend sends 0-100, convert
  if (ranking > 1) ranking = ranking / 100;
  return Math.min(100, Math.max(0, Math.round(ranking * 100)));
}

const CandidateCard = ({ jobId, candidate, reloadCandidates }: CandidateCardProps) => {
  // Canonical profile URL format: https://www.neunet.io/job-candidates/{job_id}/candidate/{candidate_id}
  const profileUrl = `https://www.neunet.io/job-candidates/${candidate.job_id}/candidate/${candidate.candidate_id}`;
  // Normalize ranking to 0-100% if needed
  let matchScore: string | number = 'N/A';
  if (typeof candidate.ranking === 'number') {
    matchScore = candidate.ranking > 1 ? Math.round(candidate.ranking) : Math.round(candidate.ranking * 100);
    matchScore = Math.max(0, Math.min(100, matchScore));
  }

  const navigate = useNavigate();
  const toast = useToast();
  // Track download error for this candidate
  const [downloadFailed, setDownloadFailed] = useState(false);
  // Shortlist/Reject state
  const [actionInProgress, setActionInProgress] = useState<null | 'shortlist' | 'reject'>(null);
  const [localStatus, setLocalStatus] = useState(candidate.status);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Keep localStatus in sync with candidate.status prop
  useEffect(() => { setLocalStatus(candidate.status); }, [candidate.status]);

  // Only destructure once
  const { candidate_id, name, email, ranking, status, applied_at, resume, resume_blob_name } = candidate;

  // Extract links from resume (support both camelCase and space keys)
  let github = '';
function normalizeGithubLink(link: string): string {
  if (!link) return '';
  if (link.startsWith('http://') || link.startsWith('https://')) return link;
  // Remove any accidental leading slashes or spaces
  const cleaned = link.replace(/^\/+/,'').trim();
  return `https://${cleaned}`;
}
  let linkedin = '';
  let resumeObj = resume;
  if (typeof resume === 'string') {
    try {
      resumeObj = JSON.parse(resume);
    } catch (e) {
      resumeObj = {};
    }
  }
  if (resumeObj) {
    github = resumeObj.github || resumeObj.gitHub || resumeObj.GitHub || (resumeObj.links?.gitHub || resumeObj.links?.github || resumeObj.links?.GitHub || resumeObj["links"]?.gitHub || resumeObj["links"]?.github || resumeObj["links"]?.GitHub) || '';
    linkedin = resumeObj.linkedin || resumeObj.linkedIn || resumeObj.LinkedIn || (resumeObj.links?.linkedIn || resumeObj.links?.linkedin || resumeObj.links?.LinkedIn || resumeObj["links"]?.linkedIn || resumeObj["links"]?.linkedin || resumeObj["links"]?.LinkedIn) || '';
  }

  // Shortlist handler
  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!candidate_id) {
      toast({ title: 'Missing candidate ID', status: 'error', duration: 3000 });
      return;
    }
    setActionInProgress('shortlist');
    try {
      console.log('[Shortlist] Updating status:', jobId, candidate_id, 'Shortlisted');
      const resp = await updateCandidateStatus(jobId, candidate_id, 'Shortlisted');
      console.log('[Shortlist] API response:', resp);
      setLocalStatus('Shortlisted');
      toast({ title: 'Candidate Shortlisted', status: 'success', duration: 2000 });
      reloadCandidates();
    } catch (err) {
      toast({ title: 'Failed to shortlist candidate', status: 'error', duration: 3000 });
    } finally {
      setActionInProgress(null);
    }
  };

  // Download handler for actual resume file (PDF/DOCX)
  const handleDownloadResume = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Fetch the resume file as a blob from backend
      const response = await getCandidateResume(jobId, email, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      // Try to get filename from Content-Disposition header
      const disposition = response.headers['content-disposition'];
      let filename = 'resume.pdf';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/['"]/g, '');
      }
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadFailed(true);
      toast({
        title: 'Resume Not Found',
        description: 'Failed to download resume file.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };



  return (
    <Box>
      {/* Always use candidate_id for navigation/profile links. Never fallback to email. */}
      <Flex 
        py={4} 
        align="center"
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
        borderRadius="md"
        onClick={() => {
           console.log('[CandidateCard] candidate:', candidate);
           if (candidate.candidate_id) {
             navigate(`/job-candidates/${encodeURIComponent(jobId)}/candidate/${encodeURIComponent(candidate.candidate_id)}`);
           } else {
             toast({ title: 'Invalid candidate profile', status: 'error', duration: 3000 });
           }
         }}
      >
        <Avatar size="md" name={name} mr={4} />
        <Box flex={1}>
          <Text fontWeight="medium">{name}</Text>
          <Text color="gray.600" fontSize="sm">{email}</Text>
          <HStack mt={1} spacing={2}>
            <Badge
              colorScheme={(() => {
                const s = (status || '').trim().toLowerCase();
                if (s === 'applied') return 'blue';
                if (s === 'shortlisted') return 'green';
                if (s === 'rejected') return 'red';
                return 'gray';
              })()}
              textTransform="uppercase"
            >
              {status}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              Applied {new Date(applied_at).toLocaleDateString()}
            </Text>
            <Badge colorScheme="purple" ml={2} fontSize="xs">
              Match score: {matchScore !== 'N/A' ? `${matchScore}%` : 'N/A'}
            </Badge>
          </HStack>
          <HStack mt={2} spacing={2}>
            {/* Always use candidate_id for profile links. Never fallback to email. */}
            {candidate.candidate_id ? (
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/job-candidates/${encodeURIComponent(jobId)}/candidate/${encodeURIComponent(candidate.candidate_id)}`);
                }}
              >
                View Profile
              </Button>
            ) : (
              <Tooltip label="Invalid candidate profile">
                <Button size="sm" colorScheme="teal" variant="outline" isDisabled>
                  View Profile
                </Button>
              </Tooltip>
            )}
          </HStack>
        </Box>
        <HStack spacing={4} align="center" justify="flex-end" flex={1}>
          <Box textAlign="right" minW="56px">
            {/* Display ranking as a percentage, clamped to 100% */}
            <Text color="#9C6CFE" fontSize="xl" fontWeight="bold">
              {Number.isFinite(ranking) ? `${normalizeRanking(ranking)}%` : '0%'}
            </Text>
            <Text fontSize="xs" color="gray.500">Score</Text>
          </Box>
          {github && (
            <a href={normalizeGithubLink(github)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <IconButton
                aria-label="GitHub"
                icon={<Icon as={FiGithub} />}
                size="sm"
                variant="ghost"
              />
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <IconButton
                aria-label="LinkedIn"
                icon={<Icon as={SiLinkedin} />}
                size="sm"
                variant="ghost"
              />
            </a>
          )}
          {(() => {
            // Defensive check: must be string, not empty, not 'null', not 'undefined', and must look like a file
            const validExtensions = ['.pdf', '.doc', '.docx'];
            const isValidResume =
              resume_blob_name &&
              typeof resume_blob_name === 'string' &&
              resume_blob_name.trim() !== '' &&
              resume_blob_name.trim().toLowerCase() !== 'null' &&
              resume_blob_name.trim().toLowerCase() !== 'undefined' &&
              validExtensions.some(ext => resume_blob_name.trim().toLowerCase().endsWith(ext));
            return (
              isValidResume && !downloadFailed && (
                <IconButton
                  aria-label="Download Resume"
                  icon={<Icon as={FiDownload} />}
                  size="sm"
                  variant="ghost"
                  onClick={handleDownloadResume}
                />
              )
            );
          })()}

          {/* Shortlist/Reject Buttons */}
          <HStack spacing={2} ml={2}>
            <Tooltip label="Shortlist" hasArrow>
              <IconButton
                aria-label="Shortlist"
                icon={<svg width="2em" height="2em" viewBox="0 0 20 20" fill="currentColor"><path d="M7.629 15.707a1 1 0 0 1-1.415 0l-3.92-3.92a1 1 0 1 1 1.415-1.414l3.213 3.213 7.293-7.293a1 1 0 1 1 1.414 1.414l-8 8z"/></svg>} 
                colorScheme="green"
                variant="ghost"
                size="sm"
                isDisabled={(() => {
  const s = (localStatus || '').trim().toLowerCase();
  if (actionInProgress === 'reject') return true;
  if (s === 'shortlisted') return false;
  if (s === 'rejected') return true;
  return false;
})()}
                isLoading={actionInProgress === 'shortlist'}
                onClick={e => { e.stopPropagation(); handleShortlist(e); }}
              />
            </Tooltip>
            <Tooltip label="Reject" hasArrow>
              <IconButton
                aria-label="Reject"
                icon={<svg width="1.5em" height="1.5em" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8.586l4.95-4.95a1 1 0 1 1 1.414 1.415l-4.95 4.95 4.95 4.95a1 1 0 0 1-1.414 1.415l-4.95-4.95-4.95 4.95A1 1 0 0 1 3.05 15.05l4.95-4.95-4.95-4.95A1 1 0 1 1 4.464 3.636L10 9.172z"/></svg>} 
                colorScheme="red"
                variant="ghost"
                size="sm"
                isDisabled={(() => {
  const s = (localStatus || '').trim().toLowerCase();
  if (actionInProgress === 'shortlist') return true;
  if (s === 'rejected') return false;
  if (s === 'shortlisted') return true;
  return false;
})()}
                isLoading={actionInProgress === 'reject'}
                onClick={e => { e.stopPropagation(); setIsRejectDialogOpen(true); }}
              />
            </Tooltip>
          </HStack>
          {/* Reject Confirmation Dialog */}
          <AlertDialog
            isOpen={isRejectDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsRejectDialogOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Reject Candidate
                </AlertDialogHeader>
                <AlertDialogBody>
                  Are you sure you want to reject this candidate?
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={() => setIsRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" ml={3} isLoading={actionInProgress === 'reject'} onClick={async (e) => {
                    e.stopPropagation();
                    if (!candidate_id) {
                      toast({ title: 'Missing candidate ID', status: 'error', duration: 3000 });
                      setActionInProgress(null);
                      return;
                    }
                    setActionInProgress('reject');
                    try {
                      console.log('[Reject] Updating status:', jobId, candidate_id, 'Rejected');
                      const resp = await updateCandidateStatus(jobId, candidate_id, 'Rejected');
                      console.log('[Reject] API response:', resp);
                      setLocalStatus('Rejected');
                      toast({ title: 'Candidate Rejected', status: 'success', duration: 2000 });
                      setIsRejectDialogOpen(false);
                      reloadCandidates();
                    } catch (err) {
                      toast({ title: 'Failed to reject candidate', status: 'error', duration: 3000 });
                    } finally {
                      setActionInProgress(null);
                    }
                  }}>
                    Reject
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </HStack>
      </Flex>
      <Divider />
    </Box>
  );
}


const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <Box 
    bg="gray.50" 
    p={4} 
    borderRadius="lg"
    shadow="sm"
    w="100%"
  >
    <Text color="gray.600" fontSize="sm">{label}</Text>
    <Text fontSize="2xl" fontWeight="bold">{value}</Text>
  </Box>
)

export const JobCandidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest'>('highest');
  const [loading, setLoading] = useState(true);

  const loadJobAndCandidates = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const [jobData, candidatesDataRaw] = await Promise.all([
        fetchJobById(jobId),
        getJobCandidates(jobId)
      ]);
      // Filter and normalize candidates
      const candidatesData = (candidatesDataRaw || []).filter((c: any) => {
        if (!c || typeof c !== 'object') return false;
        return ((typeof c.ranking === 'number' || typeof c.score === 'number' || (c.evaluation && typeof c.evaluation.total === 'number')) && c.name && c.email);
      }).map((c: any) => {
        if (typeof c.ranking !== 'number') {
          if (typeof c.score === 'number') {
            c.ranking = c.score;
          } else if (c.evaluation && typeof c.evaluation.total === 'number') {
            c.ranking = c.evaluation.total;
          } else {
            c.ranking = 0;
          }
        }
        return c;
      });
      setJob(jobData);
      setCandidates(candidatesData);
      console.log('[JobCandidates] Filtered candidates:', candidatesData);
      // Debug: Log each candidate's email and status to verify backend update
      candidatesData.forEach(c => {
        console.log(`[StatusCheck] Candidate: ${c.email}, Status: ${c.status}`);
      });
    } catch (error) {
      console.error('Error loading job and candidates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job details and candidates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      loadJobAndCandidates();
    }
  }, [jobId, toast]);

  // Only show candidates with a valid candidate_id
  const filteredCandidates = candidates.filter(c => c.candidate_id && String(c.candidate_id).trim() !== '');
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const aRank = Number.isFinite(a.ranking) ? a.ranking as number : 0;
    const bRank = Number.isFinite(b.ranking) ? b.ranking as number : 0;
    if (sortOrder === 'highest') {
      return bRank - aRank;
    } else {
      return aRank - bRank;
    }
  });

  const averageScore = filteredCandidates.length 
    ? Math.round(filteredCandidates.reduce((sum, c) => sum + (Number.isFinite(c.ranking) ? c.ranking as number : 0), 0) / filteredCandidates.length) 
    : 0;

  const shortlisted = filteredCandidates.filter(c => typeof c.status === 'string' && c.status.trim().toLowerCase() === 'shortlisted').length;
const rejected = filteredCandidates.filter(c => typeof c.status === 'string' && c.status.trim().toLowerCase() === 'rejected').length;

  if (!job) {
    return (
      <Box pl="160px" pr="120px" py={8}>
        <Button
          as={RouterLink}
          to="/jobs"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          color="gray.600"
          mb={6}
        >
          Back to Jobs
        </Button>
        <Text>Loading job details...</Text>
      </Box>
    );
  }

  return (
    <Box pl="160px" pr="120px" py={8}>
      <Button
        as={RouterLink}
        to="/jobs"
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        color="gray.600"
        mb={6}
      >
        Back to Jobs
      </Button>

      <Flex justify="space-between" align="start" mb={8}>
        <VStack align="start" spacing={4}>
          <Heading size="lg">{job.title}</Heading>
          <HStack spacing={2}>
            <Badge colorScheme="blue">{job.location}</Badge>
            <Badge colorScheme="green">{job.job_type}</Badge>
            <Badge colorScheme="purple">{job.salary_range}</Badge>
          </HStack>
        </VStack>
      </Flex>

      {/* Tabs for Candidates and Job Details */}
      {/* --- Tab URL Sync Start --- */}
      {/* This enables tab selection via ?tab=candidates or ?tab=details in the URL */}
      <Tabs
        colorScheme="purple"
        variant="enclosed"
        index={searchParams.get('tab') === 'details' ? 1 : 0}
        onChange={idx => {
          setSearchParams({ tab: idx === 1 ? 'details' : 'candidates' });
        }}
      >
        <TabList>
          <Tab>Candidates</Tab>
          <Tab>Job Details</Tab>
        </TabList>
        <TabPanels>
          {/* Candidates Tab */}
          <TabPanel px={0}>
            <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={8}>
              <StatBox label="Total Candidates" value={filteredCandidates.length} />
              <StatBox label="Average Score" value={`${averageScore}%`} />
              <StatBox label="Shortlisted" value={shortlisted} />
              <StatBox label="Rejected" value={rejected} />
            </Grid>

            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md">Candidates</Heading>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'highest' | 'lowest')}
                width="200px"
              >
                <option value="highest">Highest Score First</option>
                <option value="lowest">Lowest Score First</option>
              </Select>
            </Flex>

            <VStack spacing={0} align="stretch">
              {sortedCandidates.map((candidate) => (
                // Defensive: Only render if candidate has a ranking, name, and email
                (typeof candidate.ranking === 'number' && candidate.name && candidate.email) ? (
                  <CandidateCard
                    key={candidate.candidate_id || candidate.email}
                    jobId={jobId!}
                    candidate={candidate}
                    reloadCandidates={loadJobAndCandidates}
                  />
                ) : null
              ))}
              {sortedCandidates.length === 0 && (
                <Text color="gray.500" textAlign="center" py={8}>
                  No candidates have applied for this position yet.
                </Text>
              )}
            </VStack>
          </TabPanel>

          {/* Job Details Tab */}
          <TabPanel px={0}>
            <VStack align="start" spacing={4}>
              <Box>
                <Text fontWeight="semibold">Description:</Text>
                <Text whiteSpace="pre-line">{job.description}</Text>
              </Box>
              {job.requirements && (
                <Box>
                  <Text fontWeight="semibold">Requirements:</Text>
                  <Text whiteSpace="pre-line">{job.requirements}</Text>
                </Box>
              )}
              {job.responsibilities && (
                <Box>
                  <Text fontWeight="semibold">Responsibilities:</Text>
                  <Text whiteSpace="pre-line">{job.responsibilities}</Text>
                </Box>
              )}
              {job.growth_opportunities && (
                <Box>
                  <Text fontWeight="semibold">Growth Opportunities:</Text>
                  <Text whiteSpace="pre-line">{job.growth_opportunities}</Text>
                </Box>
              )}
              {job.tech_stack && (
                <Box>
                  <Text fontWeight="semibold">Tech Stack:</Text>
                  <Text>{job.tech_stack}</Text>
                </Box>
              )}
              {job.salary_range && (
                <Box>
                  <Text fontWeight="semibold">Salary Range:</Text>
                  <Text>{job.salary_range}</Text>
                </Box>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};