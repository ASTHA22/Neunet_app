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
} from '@chakra-ui/react'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { BsGithub } from 'react-icons/bs'
import { FaLinkedin } from 'react-icons/fa'
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
}

interface ResumeDetails {
  email?: string;
  phone_number?: string;
  linkedIn?: string;
  github?: string;
  [key: string]: any;
}

import React from 'react';
import { useEffect, useState } from 'react';
import { getCandidateById, getCandidateResume } from '../services/api';

const CandidateDetails: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
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

  // Find the job with the highest evaluation score
  const highestEvalJob = sortedJobsApplied.reduce((max, job) => {
    if (job.evaluation && (!max || (job.evaluation.total > (max.evaluation?.total || 0)))) {
      return job;
    }
    return max;
  }, null as any);

  return (
    <Box p={{ base: 2, md: 8 }} maxW="1200px" mx="auto">
      {/* Use React Router's useNavigate for proper back navigation */}
      <Button onClick={() => navigate(-1)} leftIcon={<FiArrowLeft />} mb={6} variant="ghost" colorScheme="purple">
        Back
      </Button>
      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        {/* Profile/Avatar Column */}
        <VStack w={{ base: '100%', md: '320px' }} align="stretch" spacing={6}>
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6} alignItems="center" textAlign="center">
            <Avatar size="2xl" name={candidate.name} src={candidate.avatar} mb={4} />
            <Heading size="md">{candidate.name}</Heading>
            <Text color="gray.500" mb={2}>{candidate.role}</Text>
            {candidate.email && <Text fontSize="sm" color="gray.600">{candidate.email}</Text>}
            {(candidate.phone_number || candidate.parsed_resume?.phone_number) && (
              <Text fontSize="sm" color="gray.600">
                {candidate.phone_number || candidate.parsed_resume?.phone_number}
              </Text>
            )}
            <Divider my={4} />
            <HStack justify="center" spacing={3}>
              {(candidate.parsed_resume?.github || candidate.parsed_resume?.links?.github) && (
                <IconButton
                  as="a"
                  href={candidate.parsed_resume?.github || candidate.parsed_resume?.links?.github}
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
          </Box>
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
                        <Badge key={i} colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="sm">{kw}</Badge>
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
            <Heading size="sm" mb={2}>Evaluation Score</Heading>
            {highestEvalJob && highestEvalJob.evaluation ? (
              <>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600" mb={2}>{highestEvalJob.evaluation.total}</Text>
                <HStack spacing={6} justify="start" mt={2}>
                  <Box>
                    <Text fontWeight="medium">Technical Skills</Text>
                    <Text color="gray.600">{highestEvalJob.evaluation.technicalSkills}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Problem Solving</Text>
                    <Text color="gray.600">{highestEvalJob.evaluation.problemSolving}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Communication</Text>
                    <Text color="gray.600">{highestEvalJob.evaluation.communication}</Text>
                  </Box>
                </HStack>
              </>
            ) : (
              <Text color="gray.500">No evaluation data available.</Text>
            )}
          </Box>
          {/* GitHub Statistics */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading size="sm" mb={2}>GitHub Statistics</Heading>
            {candidate.github ? (
              <HStack spacing={8}>
                <Box>
                  <Text fontWeight="medium">Commits</Text>
                  <Text color="gray.600">{candidate.github.totalCommits}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium">Repositories</Text>
                  <Text color="gray.600">{candidate.github.repositories}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium">Pull Requests</Text>
                  <Text color="gray.600">{candidate.github.pullRequests}</Text>
                </Box>
              </HStack>
            ) : (
              <Text color="gray.500">No GitHub data available.</Text>
            )}
          </Box>
          {/* Skills */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading size="sm" mb={2}>Skills</Heading>
            {candidate.skills && candidate.skills.length > 0 ? (
              <HStack spacing={2} flexWrap="wrap">
                {candidate.skills.map((skill, idx) => (
                  <Badge key={idx} colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="md" mb={2}>
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
                        <Badge
                          colorScheme={
                            job.status?.toLowerCase() === 'applied'
                              ? 'blue'
                              : job.status?.toLowerCase() === 'approved'
                              ? 'green'
                              : job.status?.toLowerCase() === 'rejected'
                              ? 'red'
                              : 'gray'
                          }
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                          fontWeight="bold"
                          variant="subtle"
                          textTransform="uppercase"
                        >
                          {job.status ? job.status.toUpperCase() : ''}
                        </Badge>
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
