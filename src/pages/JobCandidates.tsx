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
} from '@chakra-ui/react'
import { FiArrowLeft, FiGithub, FiDownload } from 'react-icons/fi'
import { SiLinkedin } from 'react-icons/si'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { fetchJobById, getJobCandidates } from '../services/api'
import { Job } from '../types/job'

interface Candidate {
  name: string;
  email: string;
  ranking: number;
  status: string;
  applied_at: string;
  cover_letter?: string;
}

interface CandidateCardProps {
  jobId: string;
  candidate: Candidate;
}

const CandidateCard = ({ jobId, candidate }: CandidateCardProps) => {
  const navigate = useNavigate();
  const { name, email, ranking, status, applied_at } = candidate;
  
  return (
    <Box>
      <Flex 
        py={4} 
        align="center"
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
        borderRadius="md"
        onClick={() => navigate(`/job-candidates/${jobId}/candidate/${email}`)}
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
        <HStack spacing={6} align="center">
          <Box textAlign="right">
            <Text color="#9C6CFE" fontSize="xl" fontWeight="bold">
              {Math.round(ranking * 100)}
            </Text>
            <Text fontSize="xs" color="gray.500">Score</Text>
          </Box>
          <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
            <IconButton
              aria-label="GitHub"
              icon={<Icon as={FiGithub} />}
              size="sm"
              variant="ghost"
              as={RouterLink}
              to="#"
            />
            <IconButton
              aria-label="LinkedIn"
              icon={<Icon as={SiLinkedin} />}
              size="sm"
              variant="ghost"
              as={RouterLink}
              to="#"
            />
            <IconButton
              aria-label="Download Resume"
              icon={<Icon as={FiDownload} />}
              size="sm"
              variant="ghost"
              as={RouterLink}
              to="#"
            />
          </HStack>
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
        const [jobData, candidatesData] = await Promise.all([
          fetchJobById(jobId),
          getJobCandidates(jobId)
        ]);

        console.log('Loaded candidates:', candidatesData); // Debug log
        setJob(jobData);
        setCandidates(candidatesData || []);
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

    loadJobAndCandidates();
  }, [jobId, toast]);

  const sortedCandidates = [...candidates].sort((a, b) => {
    return sortOrder === 'highest' 
      ? b.ranking - a.ranking 
      : a.ranking - b.ranking;
  });

  const averageScore = candidates.length 
    ? Math.round(candidates.reduce((sum, c) => sum + c.ranking * 100, 0) / candidates.length) 
    : 0;

  const shortlisted = candidates.filter(c => c.ranking >= 0.8).length;
  const rejected = candidates.filter(c => c.ranking < 0.5).length;

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

      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={8}>
        <StatBox label="Total Candidates" value={candidates.length} />
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
          <CandidateCard
            key={candidate.email}
            jobId={jobId!}
            candidate={candidate}
          />
        ))}
        {sortedCandidates.length === 0 && (
          <Text color="gray.500" textAlign="center" py={8}>
            No candidates have applied for this position yet.
          </Text>
        )}
      </VStack>
    </Box>
  );
};
