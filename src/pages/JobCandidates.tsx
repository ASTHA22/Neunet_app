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
import { fetchJobById, getJobCandidates, getCandidateResume } from '../services/api'
import { Job } from '../types/job'

import { ResumeData } from '../types/resume';

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
}

// Utility: Clamp and convert ranking to percentage (0-100%)
function normalizeRanking(ranking: number): number {
  // Accept floats between 0 and 1; if backend sends 0-100, convert
  if (ranking > 1) ranking = ranking / 100;
  return Math.min(100, Math.max(0, Math.round(ranking * 100)));
}

const CandidateCard = ({ jobId, candidate }: CandidateCardProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  // Track download error for this candidate
  const [downloadFailed, setDownloadFailed] = useState(false);
  // Only destructure once
  const { candidate_id, name, email, ranking, status, applied_at, resume, resume_blob_name } = candidate;

  // Extract links from resume (support both camelCase and space keys)
  let github = '';
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
      <Flex 
        py={4} 
        align="center"
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
        borderRadius="md"
        onClick={() => navigate(`/job-candidates/${encodeURIComponent(jobId)}/candidate/${encodeURIComponent(candidate.candidate_id || candidate.email)}`)}
      >
        <Avatar size="md" name={name} mr={4} />
        <Box flex={1}>
          <Text fontWeight="medium">{name}</Text>
          <Text color="gray.600" fontSize="sm">{email}</Text>
          <HStack mt={1} spacing={2}>
            <Badge colorScheme={status === 'applied' ? 'blue' : 'green'}>{status}</Badge>
            <Text fontSize="xs" color="gray.500">
              Applied {new Date(applied_at).toLocaleDateString()}
            </Text>
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
            <a href={github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
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

  useEffect(() => {
    const loadJobAndCandidates = async () => {
      if (!jobId) return;

      try {
        setLoading(true);
        const [jobData, candidatesDataRaw] = await Promise.all([
          fetchJobById(jobId),
          getJobCandidates(jobId)
        ]);

        // Debug: log raw candidates data
        console.log('[JobCandidates] Raw candidatesData:', candidatesDataRaw);

        // Filter: Only include objects that have a name, email, and ranking (real candidates)
        const candidatesData = (candidatesDataRaw || []).filter((c: any) => {
          if (!c || typeof c !== 'object') return false;
          // Accept if ranking, name, and email present
          return ((typeof c.ranking === 'number' || typeof c.score === 'number' || (c.evaluation && typeof c.evaluation.total === 'number')) && c.name && c.email);
        }).map((c: any) => {
          // Fallback: If ranking is missing, but score or evaluation.total is present, use it and log a warning
          if (typeof c.ranking !== 'number') {
            if (typeof c.score === 'number') {
              console.warn('[JobCandidates] Candidate missing ranking, using score as fallback:', c);
              c.ranking = c.score;
            } else if (c.evaluation && typeof c.evaluation.total === 'number') {
              console.warn('[JobCandidates] Candidate missing ranking, using evaluation.total as fallback:', c);
              c.ranking = c.evaluation.total;
            } else {
              // Set default to 0 if all else fails
              console.warn('[JobCandidates] Candidate missing ranking/score/evaluation, setting ranking to 0:', c);
              c.ranking = 0;
            }
          }
          return c;
        });

        setJob(jobData);
        setCandidates(candidatesData);
        // Debug: log filtered candidate data
        console.log('[JobCandidates] Filtered candidates:', candidatesData);
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

  const shortlisted = filteredCandidates.filter(c => (Number.isFinite(c.ranking) ? c.ranking as number : 0) >= 0.8).length;
  const rejected = filteredCandidates.filter(c => (Number.isFinite(c.ranking) ? c.ranking as number : 0) < 0.5).length;

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
