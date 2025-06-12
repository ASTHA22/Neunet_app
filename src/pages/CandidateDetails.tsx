import {
  Box,
  Button,
  Heading,
  Text,
  HStack,
  Avatar,
  Flex,
  Badge,
  Icon,
  VStack,
  IconButton,
  Divider,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button as ChakraButton,
  Collapse
} from '@chakra-ui/react'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import { Link as RouterLink, useParams } from 'react-router-dom' // useParams for both jobId and candidateId
import { BsGithub } from 'react-icons/bs'
import { FaLinkedin } from 'react-icons/fa'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom' // Import useNavigate

interface Skill {
  name: string;
}

interface JobApplied {
  job_id: string;
  title?: string;
  status?: string;
  applied_at?: string;
  ranking?: number;
  score?: number;
  resume_blob_name?: string;
  explanation?: string;
}

interface CandidateData {
  candidate_id?: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  phone_number?: string;
  evaluation: {
    total: number;
    technicalSkills: number;
    problemSolving: number;
    communication: number;
  };
  github: {
    totalCommits: number;
    repositories: number;
    pullRequests: number;
  };
  skills: Skill[];
  jobsApplied?: JobApplied[];
  parsed_resume?: ResumeDetails;
  github_analysis?: any; // Added for GitHub Analysis integration
}

interface ResumeDetails {
  email?: string;
  phone_number?: string;
  linkedIn?: string;
  github?: string;
  [key: string]: any;
}

function normalizeGithubLink(link: string): string {
  if (!link) return '';
  if (link.startsWith('http://') || link.startsWith('https://')) return link;
  // Remove any accidental leading slashes or spaces
  const cleaned = link.replace(/^\/+/,'').trim();
  return `https://${cleaned}`;
}

import React from 'react';
import { useEffect, useState } from 'react';

// Utility: Clamp and convert ranking to percentage (0-100%)
function normalizeRanking(ranking: number): number {
  // If ranking is between 0 and 1, treat as normalized float and multiply by 100
  if (typeof ranking === 'number' && ranking > 0 && ranking <= 1) {
    return Math.round(ranking * 100 * 1000) / 1000; // up to 3 decimals
  }
  // Otherwise, return as is (rounded to 3 decimals)
  return Math.round(ranking * 1000) / 1000;
}
import { getCandidateById, getCandidateResume, updateCandidateStatus } from '../services/api';
import { useToast } from '@chakra-ui/react';

const CandidateDetails: React.FC = () => {
  // Track action in progress for each job
  const [jobActionInProgress, setJobActionInProgress] = useState<{ [jobId: string]: 'shortlist' | 'reject' | null }>({});
  const [actionInProgress, setActionInProgress] = React.useState<null | 'shortlist' | 'reject'>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [selectedJobEvalStatus, setSelectedJobEvalStatus] = React.useState<string | undefined>(undefined);
  const toast = useToast();

  // State for expanding/collapsing contribution_insights
  const [expandedRepoIdx, setExpandedRepoIdx] = useState<number | null>(null);

  const { candidateId, jobId: jobIdFromParams } = useParams<{ candidateId: string; jobId?: string }>();
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const data = await getCandidateById(candidateId!);
        // Always parse resume if present as string, and assign to parsed_resume
        if (data) {
          if (data.resume && typeof data.resume === 'string') {
            try {
              data.parsed_resume = JSON.parse(data.resume);
            } catch (e) {
              data.parsed_resume = undefined;
            }
          } else if (data.resume && typeof data.resume === 'object') {
            data.parsed_resume = data.resume;
          }
        }
        // Normalize parsed_resume fields if present
        if (data && data.parsed_resume) {
          let pr = data.parsed_resume;
          // If parsed_resume is in { success, data } format, use data
          if (pr.success && pr.data) {
            pr = pr.data;
            data.parsed_resume = pr;
          }
          // Map phone number
          pr.phone_number = pr.phone_number || pr["phone number"] || '';
          // Map skills (comma string or array)
          if (typeof pr.skills === 'string') {
            pr.skills = pr.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          // Map keywords (comma string or array)
          if (typeof pr.keywords === 'string') {
            pr.keywords = pr.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
          }
          // Map education, and map 'institute' to 'institution' if needed
          if (pr.education && Array.isArray(pr.education)) {
            pr.education = pr.education.map((edu: any) => ({
              ...edu,
              institution: edu.institution || edu.institute || '',
              year: edu.year || edu.end || '',
            }));
          } else {
            pr.education = [];
          }
          // Map experience: support both 'work experience' and 'experience'
          pr.experience = pr.experience || pr['work experience'] || [];
          // If experience is an array, map organization->company if company not present
          if (Array.isArray(pr.experience)) {
            pr.experience = pr.experience.map((exp: any) => ({
              ...exp,
              company: exp.company || exp.organization || '',
              duration: exp.duration || `${exp['start date'] || exp.start || ''} - ${exp['end date'] || exp.end || ''}`.replace(/^ - | - $/g, ''),
            }));
          }
          // Map links
          if (pr.links) {
            pr.linkedIn = pr.linkedIn || pr.links.linkedIn || pr.links.linkedin || '';
            pr.github = pr.github || pr.links.gitHub || pr.links.github || '';
          }
          // Map location
          pr.location = pr.location || '';
        }
        // Normalize candidate.skills to Skill[] for rendering
        if (data) {
          if (Array.isArray(data.skills) && data.skills.length > 0) {
            if (typeof data.skills[0] === "string") {
              data.skills = data.skills.map((s: string) => ({ name: s }));
            }
          } else if (data.parsed_resume && Array.isArray(data.parsed_resume.skills) && data.parsed_resume.skills.length > 0) {
            data.skills = data.parsed_resume.skills.map((s: string) => ({ name: s }));
          }
        }
        setCandidate(data);
      } catch (err) {
        setError('Failed to load candidate details.');
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  if (loading) {
    return <Box p={8}><Text>Loading...</Text></Box>;
  }
  if (error) {
    return <Box p={8}><Text color="red.500">{error}</Text></Box>;
  }
  if (!candidate) {
    return <Box p={8}><Text>No candidate found.</Text></Box>;
  }

  // Sort jobsApplied by applied_at descending (latest first)
  const sortedJobsApplied = candidate.jobsApplied?.sort((a, b) => new Date(b.applied_at!).getTime() - new Date(a.applied_at!).getTime()) || [];

  // If jobId is present, find the job application for that job
    // If jobId is present, find the job application for that job
  const selectedJobEval = (jobIdFromParams && candidate.jobsApplied)
    ? candidate.jobsApplied.find(j => j.job_id === jobIdFromParams)
    : undefined;

  // Fallback: If no jobId or not found, use the job with the highest ranking
  const highestRankingJob = sortedJobsApplied.reduce((max, job) => {
    if ((job as any).ranking !== undefined && (!max || ((job as any).ranking > (max as any)?.ranking))) {
      return job;
    }
    return max;
  }, null as any);

  const evaluationJob = selectedJobEval || highestRankingJob;

  // Render explanation if present
  const showExplanation = evaluationJob && evaluationJob.explanation && evaluationJob.explanation.trim() !== '';

  return (
    <Box p={{ base: 2, md: 8 }} maxW="1200px" mx="auto">
      {/* Use React Router's useNavigate for proper back navigation */}
      <Button onClick={() => navigate(-1)} leftIcon={<FiArrowLeft />} mb={6} variant="ghost" colorScheme="purple">
        Back
      </Button>
      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        {/* Profile/Avatar Column */}
        <VStack w={{ base: '100%', md: '320px' }} align="stretch" spacing={6}>
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Flex justify="space-between" align="center">
              <VStack align="center" spacing={2} w="100%">
                <Avatar size="2xl" name={candidate.name} src={candidate.avatar} mb={2} />
                <Heading size="md">{candidate.name}</Heading>
{(() => {
  const status = (selectedJobEval?.status || '').trim();
  if (!status) return null;
  const s = status.toLowerCase();
  if (s !== 'applied' && s !== 'shortlisted' && s !== 'rejected') return null;
  let colorScheme = 'gray';
  if (s === 'applied') colorScheme = 'blue';
  else if (s === 'shortlisted') colorScheme = 'green';
  else if (s === 'rejected') colorScheme = 'red';
  return (
    <Badge colorScheme={colorScheme} textTransform="uppercase" fontSize="sm" mb={1}>
      {status}
    </Badge>
  );
})()}
<Text color="gray.500" mb={1}>{candidate.role}</Text>
                {candidate.email && <Text fontSize="sm" color="gray.600">{candidate.email}</Text>}
                {(candidate.phone_number || candidate.parsed_resume?.phone_number) && (
                  <Text fontSize="sm" color="gray.600">
                    {candidate.phone_number || candidate.parsed_resume?.phone_number}
                  </Text>
                )}
                {/* Action buttons below phone number, centered */}
                <HStack spacing={3} justify="center">
                  <Tooltip label="Shortlist" hasArrow>
  <IconButton
    aria-label="Shortlist"
    icon={<CheckIcon boxSize="1.5em" />}
    colorScheme="green"
    variant="ghost"
    size="md"
    isDisabled={(() => {
  const s = (selectedJobEval?.status || '').trim().toLowerCase();
  if (actionInProgress === 'shortlist' || actionInProgress === 'reject') return true;
  if (s === 'rejected') return true;
  return false;
})()}
    isLoading={actionInProgress === 'shortlist'}
    onClick={async () => {
      setActionInProgress('shortlist');
      const jobId = jobIdFromParams || '';
      const candidateId = candidate && candidate.candidate_id ? candidate.candidate_id : '';
      if (!jobId || !candidateId) {
        toast({ title: 'Missing job or candidate ID (must be UUID, not email)', status: 'error', duration: 3000 });
        setActionInProgress(null);
        return;
      }
      try {
        await updateCandidateStatus(jobId, candidateId, 'shortlisted'); // always lowercase
        toast({ title: 'Candidate Shortlisted', status: 'success', duration: 2000 });
        // Reload candidate data (like reloadCandidates in JobCandidates)
        const updatedCandidate = await getCandidateById(candidateId);
        // Robustly parse and normalize resume after shortlisting (same as in fetchCandidate)
if (updatedCandidate) {
  if (updatedCandidate.resume && typeof updatedCandidate.resume === 'string') {
    try {
      updatedCandidate.parsed_resume = JSON.parse(updatedCandidate.resume);
    } catch (e) {
      updatedCandidate.parsed_resume = undefined;
    }
  } else if (updatedCandidate.resume && typeof updatedCandidate.resume === 'object') {
    updatedCandidate.parsed_resume = updatedCandidate.resume;
  }
  if (updatedCandidate && updatedCandidate.parsed_resume) {
    let pr = updatedCandidate.parsed_resume;
    if (pr.success && pr.data) {
      pr = pr.data;
      updatedCandidate.parsed_resume = pr;
    }
    pr.phone_number = pr.phone_number || pr["phone number"] || '';
    if (typeof pr.skills === 'string') {
      pr.skills = pr.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof pr.keywords === 'string') {
      pr.keywords = pr.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
    if (pr.education && Array.isArray(pr.education)) {
      pr.education = pr.education.map((edu: any) => ({
        ...edu,
        institution: edu.institution || edu.institute || '',
        year: edu.year || edu.end || '',
      }));
    } else {
      pr.education = [];
    }
    pr.experience = pr.experience || pr['work experience'] || [];
    if (Array.isArray(pr.experience)) {
      pr.experience = pr.experience.map((exp: any) => ({
        ...exp,
        company: exp.company || exp.organization || '',
        duration: exp.duration || `${exp['start date'] || exp.start || ''} - ${exp['end date'] || exp.end || ''}`.replace(/^ - | - $/g, ''),
      }));
    }
    if (pr.links) {
      pr.linkedIn = pr.linkedIn || pr.links.linkedIn || pr.links.linkedin || '';
      pr.github = pr.github || pr.links.gitHub || pr.links.github || '';
    }
    pr.location = pr.location || '';
  }
  if (updatedCandidate) {
    if (Array.isArray(updatedCandidate.skills) && updatedCandidate.skills.length > 0) {
      if (typeof updatedCandidate.skills[0] === "string") {
        updatedCandidate.skills = updatedCandidate.skills.map((s: string) => ({ name: s }));
      }
    } else if (updatedCandidate.parsed_resume && Array.isArray(updatedCandidate.parsed_resume.skills) && updatedCandidate.parsed_resume.skills.length > 0) {
      updatedCandidate.skills = updatedCandidate.parsed_resume.skills.map((s: string) => ({ name: s }));
    }
  }
}
setCandidate(updatedCandidate);
      } catch (err) {
        toast({ title: 'Failed to shortlist candidate', status: 'error', duration: 3000 });
      } finally {
        setActionInProgress(null);
      }
    }}
  />
</Tooltip>
<Tooltip label="Reject" hasArrow>
  <IconButton
    aria-label="Reject"
    icon={<CloseIcon boxSize="1em" />}
    colorScheme="red"
    variant="ghost"
    size="md"
    isDisabled={(() => {
  const s = (selectedJobEval?.status || '').trim().toLowerCase();
  if (actionInProgress === 'shortlist' || actionInProgress === 'reject') return true;
  if (s === 'shortlisted') return true;
  return false;
})()}
    isLoading={actionInProgress === 'reject'}
    onClick={() => setIsRejectDialogOpen(true)}
  />
</Tooltip>
                </HStack>
                {/* Social/download icons row, same spacing as above */}
                <HStack justify="center" spacing={3}>
                  {(candidate.parsed_resume?.github || candidate.parsed_resume?.links?.github) && (
                    <IconButton
                      as="a"
                      href={normalizeGithubLink(candidate.parsed_resume?.github || candidate.parsed_resume?.links?.github)}
                      aria-label="GitHub"
                      icon={<BsGithub />}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="ghost"
                      size="lg"
                      _hover={{ color: 'purple.500', bg: 'gray.100' }}
                    />
                  )}
                  {(candidate.parsed_resume?.linkedIn || candidate.parsed_resume?.links?.linkedIn) && (
                    <IconButton
                      as="a"
                      href={candidate.parsed_resume?.linkedIn || candidate.parsed_resume?.links?.linkedIn}
                      aria-label="LinkedIn"
                      icon={<FaLinkedin />}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="ghost"
                      size="lg"
                      _hover={{ color: 'purple.500', bg: 'gray.100' }}
                    />
                  )}
                  {/* Download Resume Button (if available) */}
                  {sortedJobsApplied.length > 0 && !!sortedJobsApplied[0]?.resume_blob_name && (
                    <IconButton
                      aria-label="Download Resume"
                      icon={<FiDownload />}
                      variant="ghost"
                      size="lg"
                      onClick={async () => {
                        const jobId = sortedJobsApplied[0]?.job_id;
                        const email = candidate.email || candidate.parsed_resume?.email;
                        if (!jobId || !email) {
                          alert('Resume download unavailable: missing job ID or candidate email.');
                          return;
                        }
                        try {
                          // getCandidateResume returns AxiosResponse<any>
                          const response = await getCandidateResume(
                            jobId,
                            email,
                            { responseType: 'blob' }
                          );
                          const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
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
                          alert('Failed to download resume file.');
                        }
                      }}
                      _hover={{ color: 'purple.500', bg: 'gray.100' }}
                    />
                  )}
                </HStack>
              </VStack>
            </Flex>
          </Box>
          {/* Reject confirmation dialog */}
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
                  <ChakraButton ref={cancelRef} onClick={() => setIsRejectDialogOpen(false)}>
                    Cancel
                  </ChakraButton>
                  <ChakraButton colorScheme="red" ml={3} isLoading={actionInProgress === 'reject'}
                    onClick={async () => {
                      setActionInProgress('reject');
                      const jobId = jobIdFromParams || '';
                      const candidateId = candidate && candidate.candidate_id ? candidate.candidate_id : '';
                      if (!jobId || !candidateId) {
                        toast({ title: 'Missing job or candidate ID (must be UUID, not email)', status: 'error', duration: 3000 });
                        setActionInProgress(null);
                        return;
                      }
                      try {
                        await updateCandidateStatus(jobId, candidateId, 'rejected');
                        toast({ title: 'Candidate Rejected', status: 'success', duration: 2000 });
                        // reload candidate data and re-parse resume for links
                        const data = await getCandidateById(candidateId);
                        if (data) {
                          if (data.resume && typeof data.resume === 'string') {
                            try {
                              data.parsed_resume = JSON.parse(data.resume);
                            } catch (e) {
                              data.parsed_resume = undefined;
                            }
                          } else if (data.resume && typeof data.resume === 'object') {
                            data.parsed_resume = data.resume;
                          }
                          // resume normalization (as in fetchCandidate)
                          if (data && data.parsed_resume) {
                            let pr = data.parsed_resume;
                            if (pr.success && pr.data) {
                              pr = pr.data;
                              data.parsed_resume = pr;
                            }
                            pr.phone_number = pr.phone_number || pr["phone number"] || '';
                            if (typeof pr.skills === 'string') {
                              pr.skills = pr.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
                            }
                            if (typeof pr.keywords === 'string') {
                              pr.keywords = pr.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
                            }
                            if (pr.education && Array.isArray(pr.education)) {
                              pr.education = pr.education.map((edu: any) => ({
                                ...edu,
                                institution: edu.institution || edu.institute || '',
                                year: edu.year || edu.end || '',
                              }));
                            } else {
                              pr.education = [];
                            }
                            pr.experience = pr.experience || pr['work experience'] || [];
                            if (Array.isArray(pr.experience)) {
                              pr.experience = pr.experience.map((exp: any) => ({
                                ...exp,
                                company: exp.company || exp.organization || '',
                                duration: exp.duration || `${exp['start date'] || exp.start || ''} - ${exp['end date'] || exp.end || ''}`.replace(/^ - | - $/g, ''),
                              }));
                            }
                            if (pr.links) {
                              pr.linkedIn = pr.linkedIn || pr.links.linkedIn || pr.links.linkedin || '';
                              pr.github = pr.github || pr.links.gitHub || pr.links.github || '';
                            }
                            pr.location = pr.location || '';
                          }
                          if (data) {
                            if (Array.isArray(data.skills) && data.skills.length > 0) {
                              if (typeof data.skills[0] === "string") {
                                data.skills = data.skills.map((s: string) => ({ name: s }));
                              }
                            } else if (data.parsed_resume && Array.isArray(data.parsed_resume.skills) && data.parsed_resume.skills.length > 0) {
                              data.skills = data.parsed_resume.skills.map((s: string) => ({ name: s }));
                            }
                          }
                        }
                        setCandidate(data);
                        setIsRejectDialogOpen(false);
                      } catch (err) {
                        toast({ title: 'Failed to reject candidate', status: 'error', duration: 3000 });
                      } finally {
                        setActionInProgress(null);
                      }
                    }}>
                    Reject
                  </ChakraButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
          {/* Resume Details Card */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading size="sm" mb={2}>Resume Details</Heading>
            {candidate.parsed_resume ? (
              <VStack align="start" spacing={2}>
                {candidate.parsed_resume.location && (
                  <Text><b>Location:</b> {candidate.parsed_resume.location}</Text>
                )}
                {candidate.parsed_resume.education && Array.isArray(candidate.parsed_resume.education) && candidate.parsed_resume.education.length > 0 ? (
                  <Box>
                    <Text fontWeight="medium">Education:</Text>
                    <VStack align="start" spacing={1}>
                      {candidate.parsed_resume.education.map((edu: any, i: number) => (
                        <Text key={i} fontSize="sm">{edu.degree} - {edu.institution} {edu.year ? `(${edu.year})` : ''}</Text>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <Text color="gray.400">No education details available.</Text>
                )}
                {candidate.parsed_resume.experience && Array.isArray(candidate.parsed_resume.experience) && candidate.parsed_resume.experience.length > 0 ? (
                  <Box>
                    <Text fontWeight="medium">Experience:</Text>
                    <VStack align="start" spacing={1}>
                      {candidate.parsed_resume.experience.map((exp: any, i: number) => (
                        <Text key={i} fontSize="sm">{exp.position} at {exp.company || exp.organization} {exp.duration ? `(${exp.duration})` : ''}</Text>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <Text color="gray.400">No work experience available.</Text>
                )}
                {candidate.parsed_resume.keywords && Array.isArray(candidate.parsed_resume.keywords) && candidate.parsed_resume.keywords.length > 0 && (
                  <Box>
                    <Text fontWeight="medium">Keywords:</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {candidate.parsed_resume.keywords.map((kw: string, i: number) => (
                        <Badge key={i} colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="xs">{kw}</Badge>
                      ))}
                    </HStack>
                  </Box>
                )}

                {/* If all resume fields are empty, show a fallback */}
                {!(candidate.parsed_resume.location || (candidate.parsed_resume.education && candidate.parsed_resume.education.length > 0) || (candidate.parsed_resume.experience && candidate.parsed_resume.experience.length > 0) || (candidate.parsed_resume.keywords && candidate.parsed_resume.keywords.length > 0) || (candidate.parsed_resume.skills && candidate.parsed_resume.skills.length > 0)) && (
                  <Text color="gray.400">No resume details available.</Text>
                )}
              </VStack>
            ) : (
              <Text color="gray.500">No resume details available.</Text>
            )}
          </Box>
        </VStack>
        {/* Main Content Column */}
        <VStack flex={1} align="stretch" spacing={6}>
          {/* Evaluation Scores */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading size="sm" mb={2}>
              Evaluation Score
              {evaluationJob && evaluationJob.title && (
                <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                  for {evaluationJob.title}
                </Text>
              )}
            </Heading>
            {evaluationJob && (evaluationJob as any).ranking !== undefined ? (
              <>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600" mb={1}>
                  {evaluationJob?.ranking !== undefined ? `${normalizeRanking(evaluationJob.ranking)}%` : 'N/A'}
                </Text>
                {showExplanation && (
                  <Text fontSize="md" color="gray.700" mt={2} mb={2}>
                    <strong>Insights:</strong> {evaluationJob.explanation}
                  </Text>
                )}
              </>
            ) : (
              <Text color="gray.500">No ranking data available for this job.</Text>
            )}
          </Box>
          {/* GitHub Analysis */}
          {candidate.github_analysis && (
            <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
              <Heading size="sm" mb={2}>GitHub Analysis</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack spacing={8}>
                  <Box>
                    <Text fontWeight="medium">Total Public Repositories</Text>
                    <Text color="gray.600">{candidate.github_analysis.total_repositories ?? candidate.github_analysis.total_public_repos ?? 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Total Commits</Text>
                    <Text color="gray.600">{candidate.github_analysis.total_commits ?? 'N/A'}</Text>
                  </Box>
                </HStack>
                {(candidate.github_analysis.repositories && candidate.github_analysis.repositories.length > 0) ? (
                  <Box mt={2}>
                    <Text fontWeight="medium" mb={1}>Top 5 Repositories</Text>
                    <VStack align="stretch" spacing={2}>
                      {candidate.github_analysis.repositories.slice(0, 5).map((repo: any, idx: number) => (
                        <Box key={repo.name || idx} p={3} borderRadius="md" bg="gray.50">
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="bold">{repo.name}</Text>
                              {repo.html_url && (
                                <Text fontSize="xs">
                                  <a href={normalizeGithubLink(repo.html_url)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                    View on GitHub
                                  </a>
                                </Text>
                              )}
                            </Box>
                            <Box textAlign="right">
                              <Text fontSize="sm">Commits: <b>{repo.commit_count ?? repo.commits ?? 'N/A'}</b></Text>
                              {repo.language && <Text fontSize="xs" color="gray.500">{repo.language}</Text>}
                            </Box>
                          </HStack>
                          {repo.contribution_insights && (
                            <Box mt={1}>
                              <Collapse startingHeight={32} in={expandedRepoIdx === idx} animateOpacity>
                                <Text fontSize="xs" color="gray.600" whiteSpace="pre-line">
                                  {repo.contribution_insights}
                                </Text>
                              </Collapse>
                              {repo.contribution_insights.length > 100 && (
                                <Button
                                  size="xs"
                                  variant="link"
                                  colorScheme="purple"
                                  onClick={() => setExpandedRepoIdx(expandedRepoIdx === idx ? null : idx)}
                                  mt={1}
                                >
                                  {expandedRepoIdx === idx ? 'Show less' : 'Read more'}
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <Text color="gray.500">No top repositories found.</Text>
                )}
              </VStack>
            </Box>
          )}
          {/* Skills */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading size="sm" mb={2}>Skills</Heading>
            {candidate.skills && candidate.skills.length > 0 ? (
              <HStack spacing={2} flexWrap="wrap">
                {candidate.skills.map((skill, idx) => (
                  <Badge key={idx} colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="sm" mb={2}>
                    {skill.name}
                  </Badge>
                ))}
              </HStack>
            ) : (
              <Text color="gray.500">No skills listed.</Text>
            )}
          </Box>
          {/* Jobs Applied */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading size="sm" mb={2}>Jobs Applied</Heading>
            <VStack align="stretch" spacing={2}>
              {sortedJobsApplied.length > 0 ? (
                sortedJobsApplied.map((job, idx) => (
                  <Flex key={idx} p={3} borderRadius="md" bg="gray.50" align="center" justify="space-between">
                    <Box>
                      <Text fontWeight="medium">{job.title}</Text>
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        Job ID: {job.job_id}
                      </Text>
                      <HStack spacing={2} mt={1}>
                        {job.status && (
                          <Badge
                            colorScheme={(() => {
                              const s = (job.status || '').trim().toLowerCase();
                              if (s === 'applied') return 'blue';
                              if (s === 'shortlisted') return 'green';
                              if (s === 'rejected') return 'red';
                              return 'gray';
                            })()}
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="bold"
                            variant="subtle"
                            textTransform="capitalize"
                          >
                            {job.status}
                          </Badge>
                        )}
                        <Text fontSize="xs" color="gray.500">
                          Applied {job.applied_at ? new Date(job.applied_at).toLocaleDateString() : ''}
                        </Text>
                      </HStack>
                    </Box>
                    <HStack spacing={4} align="center">
                      <Box textAlign="center" minW="56px">
                        <Text fontSize="lg" fontWeight="bold" color="purple.600" mb={0.5}>
                          {typeof job.score === 'number' ? Math.round(job.score * (job.score <= 1 ? 100 : 1)) : ''}
                        </Text>
                        <Text fontSize="xs" color="gray.500">Score</Text>
                      </Box>
                      <Button size="sm" variant="outline" colorScheme="purple" onClick={() => navigate(`/job-candidates/${job.job_id}?tab=details`)}>
                        JD
                      </Button>
                      {job.resume_blob_name && (
                        <IconButton
                          aria-label="Download Resume"
                          icon={<FiDownload />}
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const email = candidate.email || candidate.parsed_resume?.email;
                            if (!email) {
                              alert('Resume download unavailable: missing candidate email.');
                              return;
                            }
                            try {
                              // getCandidateResume returns AxiosResponse<any>
                              const response = await getCandidateResume(
                                job.job_id,
                                email,
                                { responseType: 'blob' }
                              );
                              const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
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
                              alert('Failed to download resume file.');
                            }
                          }}
                          _hover={{ color: 'purple.500', bg: 'gray.100' }}
                        />
                      )}
                    </HStack>
                  </Flex>
                ))
              ) : (
                <Text color="gray.500">No jobs applied.</Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
};

export default CandidateDetails;