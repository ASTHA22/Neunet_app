import React, { useEffect, useState } from 'react';
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

  const loadCandidateCounts = async (fetchedJobs: Job[]) => {
    const counts: Record<string, number> = {};
    for (const job of fetchedJobs) {
      try {
        const candidates = await getJobCandidates(job.job_id);
        console.log(`Candidates for job ${job.job_id}:`, candidates); // Debug log
        counts[job.job_id] = candidates?.length || 0;
      } catch (error) {
        console.error(`Error fetching candidates for job ${job.job_id}:`, error);
        counts[job.job_id] = 0;
      }
    }
    console.log('Updated candidate counts:', counts); // Debug log
    setCandidateCounts(counts);
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
    const handleFocus = () => {
      console.log('Window focused, refreshing candidate counts...'); // Debug log
      loadCandidateCounts(jobs);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [jobs]);

  // Refresh candidate counts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing candidate counts...'); // Debug log
      loadCandidateCounts(jobs);
    }, 30000);

    return () => clearInterval(interval);
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

  return (
    <Box p={8}>
      <Heading mb={6}>Job Listings</Heading>
      <VStack spacing={4} align="stretch">
        {jobs.map((job) => (
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
                    {candidateCounts[job.job_id] || 0} Candidates
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
