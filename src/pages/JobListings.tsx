import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Divider,
  Button,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, getJobCandidates } from '../services/api';
import { Job } from '../types/job';

export const JobListings: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidateCounts, setCandidateCounts] = useState<Record<string, number>>({});
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();
  // Prevent races between multiple concurrent refreshes (mount, focus, interval)
  const latestRequestId = useRef(0);
  const loadingCounts = useRef(false);

  const loadCandidateCounts = async (fetchedJobs: Job[]) => {
    // Guard: don't wipe counts if caller passes empty or undefined
    if (!Array.isArray(fetchedJobs) || fetchedJobs.length === 0) {
      console.log('loadCandidateCounts skipped: no jobs');
      return;
    }
    if (loadingCounts.current) {
      console.log('loadCandidateCounts skipped: already in flight');
      return;
    }
    loadingCounts.current = true;
    const reqId = ++latestRequestId.current;
    try {
      // Fetch per-job candidates in parallel to reduce race window
      const validToCount = fetchedJobs.filter(j => typeof j.job_id === 'string' && /^[0-9]{6}$/.test(j.job_id));
      const settled = await Promise.allSettled(
        validToCount.map(async (job) => {
          try {
            const candidates = await getJobCandidates(job.job_id);
            console.log(`Candidates for job ${job.job_id}:`, candidates);
            const key = String(job.job_id).trim();
            const count = Array.isArray(candidates)
              ? candidates.filter((c: any) => {
                  if (!c || typeof c !== 'object') return false;
                  if (c.type && String(c.type).toLowerCase() === 'application') return false; // exclude metadata rows
                  const hasIdentity = (typeof c.email === 'string' && c.email.trim() !== '') || (typeof c.candidate_email === 'string' && c.candidate_email.trim() !== '');
                  return hasIdentity;
                }).length
              : 0;
            return [key, count] as const;
          } catch (error) {
            console.error(`Error fetching candidates for job ${job.job_id}:`, error);
            return [String(job.job_id).trim(), 0] as const;
          }
        })
      );
      // Always merge results; merging is safe even if newer requests start
      const counts: Record<string, number> = {};
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          const [key, count] = r.value;
          counts[key] = count;
        } else {
          // Rejection already logged inside map; skip
        }
      }
      console.log('Updated candidate counts (merge, no discard):', counts);
      setCandidateCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      console.error('loadCandidateCounts failed:', e);
    } finally {
      loadingCounts.current = false;
    }
  };

  const loadJobs = async () => {
    try {
      const fetchedJobs = await fetchJobs();
      console.log('Fetched jobs:', fetchedJobs); // Debug log
      setJobs(fetchedJobs);
      await loadCandidateCounts(fetchedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Load jobs and candidate counts on mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Refresh candidate counts when component regains focus
  useEffect(() => {
    // Disabled focus refresh to reduce contention and in-flight skips
    return () => {};
  }, [jobs]);

  // Refresh candidate counts every 30 seconds
  useEffect(() => {
    // Disabled 30s auto-refresh to reduce request volume and race conditions
    return () => {};
  }, [jobs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/job-candidates/${jobId}`);
  };

  // Only show jobs with a valid job_id: exactly 6 digits AND a valid posted date
  const validJobs = jobs.filter(job => {
    const validId = typeof job.job_id === 'string' && /^[0-9]{6}$/.test(job.job_id);
    const validDate = job.created_at && !isNaN(Date.parse(job.created_at));
    return validId && validDate;
  });

  return (
    <Box p={8}>
      <Heading mb={6}>Job Listings</Heading>
      <VStack spacing={4} align="stretch">
        {validJobs.map((job) => (
          <Box
            key={job.job_id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
            cursor="pointer"
            onClick={() => handleJobClick(job.job_id)}
            _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
          >
            <VStack align="stretch" spacing={3}>
              <Flex align="center" justify="space-between">
                <VStack align="start" spacing={2}>
                  <Heading size="md">{job.title}</Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue">{job.location}</Badge>
                    <Badge colorScheme="green">{job.job_type}</Badge>
                    <Badge colorScheme="purple">{job.salary_range}</Badge>
                  </HStack>
                </VStack>
                <VStack align="end" spacing={1}>
                  <Text color="purple.500" fontWeight="bold">
                    {candidateCounts[String(job.job_id)] ?? 0} Candidates
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    ID: {job.job_id}
                  </Text>
                </VStack>
              </Flex>

              <Text fontSize="sm" color="gray.500">
                Posted: {formatDate(job.created_at)}
              </Text>

              <Divider />

              <Text noOfLines={2}>
                <strong>Description:</strong> {job.description}
              </Text>

              <Text noOfLines={2}>
                <strong>Requirements:</strong> {job.requirements}
              </Text>

              <Text noOfLines={2}>
                <strong>Responsibilities:</strong> {job.responsibilities}
              </Text>

              {job.tech_stack && (
                <Text noOfLines={1}>
                  <strong>Tech Stack:</strong> {job.tech_stack}
                </Text>
              )}

              <HStack spacing={4} mt={2}>
                <Button
                  flex={1}
                  size="md"
                  variant="outline"
                  colorScheme="purple"
                  leftIcon={<Icon as={FiUsers} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobClick(job.job_id);
                  }}
                  _hover={{
                    bg: 'purple.50',
                    transform: 'translateY(-1px)',
                    shadow: 'md',
                  }}
                  transition="all 0.2s"
                >
                  View Details
                </Button>
                <Button
                  flex={1}
                  size="md"
                  colorScheme="green"
                  leftIcon={<Icon as={FiSend} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/apply/${job.job_id}`);
                  }}
                  _hover={{
                    transform: 'translateY(-1px)',
                    shadow: 'md',
                  }}
                  transition="all 0.2s"
                >
                  Apply Now
                </Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
