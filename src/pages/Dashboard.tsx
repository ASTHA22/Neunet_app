import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
  Spinner,
} from '@chakra-ui/react'
import { FiArrowRight, FiCalendar, FiSearch, FiUser, FiArrowUpRight, FiBriefcase } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchJobs } from '../services/api'
import UnlimitedJobsImage from '../assets/unlimited-jobs.png'
import RemoteHiringImage from '../assets/remote-hiring.png'

interface QuickActionProps {
  icon: any
  title: string
  description?: string
  to: string
}

const QuickAction = ({ icon, title, to }: QuickActionProps) => (
  <Box
    as={Link}
    to={to}
    p={6}
    bg="bg.card"
    borderWidth="1px"
    borderColor="gray.200"
    borderRadius="xl"
    _hover={{ bg: 'rgba(156, 108, 254, 0.05)', borderColor: '#9C6CFE' }}
    display="flex"
    alignItems="center"
    gap={3}
    transition="all 0.2s"
  >
    <Icon as={icon} boxSize={5} />
    <Text fontWeight="medium">{title}</Text>
  </Box>
)

const RecentActivity = ({ title, date }: { title: string; date: string }) => (
  <Box py={2} position="relative">
    <HStack spacing={2} align="center">
      <Box position="relative">
        <Box w="6px" h="6px" bg="gray.900" borderRadius="full" zIndex={1} position="relative" />
      </Box>
      <VStack spacing={0.5} align="start">
        <Text fontSize="sm" color="gray.900">
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {date}
        </Text>
      </VStack>
    </HStack>
  </Box>
)

const FeaturedResource = ({
  title,
  description,
  isNew,
  actionText,
  to,
  image,
}: {
  title: string
  description: string
  isNew?: boolean
  actionText: string
  to: string
  image: any
}) => (
  <Flex position="relative" mb={12} minH="100px">
    <Box flex="1" pr="220px">
      {isNew && (
        <Text fontSize="sm" color="gray.500" mb={1}>
          New
        </Text>
      )}
      <Text fontSize="lg" fontWeight="medium" mb={1}>
        {title}
      </Text>
      <Text color="gray.600" fontSize="sm" mb={3}>
        {description}
      </Text>
      <HStack spacing={1} color="#9C6CFE" as={Link} to={to} _hover={{ color: '#8A5EE3' }}>
        <Text fontWeight="medium">{actionText}</Text>
        <Icon as={FiArrowRight} />
      </HStack>
    </Box>
    <Box
      position="absolute"
      right="-20"
      bottom="-20px"
      w="200px"
    >
      <Image
        src={image}
        alt={title}
        w="full"
        h="auto"
        objectFit="contain"
      />
    </Box>
  </Flex>
)

export const Dashboard = () => {
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentJobs = async () => {
      try {
        const jobs = await fetchJobs();
        // Sort by created_at descending and take top 3
        const sorted = jobs
          .filter((j: any) => j.created_at)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 2);
        setRecentJobs(sorted);
      } catch (error) {
        console.error('Error loading recent jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRecentJobs();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Box py={8} px={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Welcome to Neunet</Heading>
          <Text color="gray.600">Get started</Text>
        </Box>

        <Grid templateColumns="repeat(5, 1fr)" gap={4}>
          <QuickAction
            icon={FiBriefcase}
            title="Create a job"
            to="/create-job"
          />
          <QuickAction
            icon={FiSearch}
            title="View all jobs"
            to="/jobs"
          />
          <QuickAction
            icon={FiUser}
            title="Job Listings"
            to="/jobs"
          />
          <QuickAction
            icon={FiCalendar}
            title="Recent Applications"
            to="/jobs"
          />
          <QuickAction
            icon={FiArrowUpRight}
            title="Help & Docs"
            to="/help"
          />
        </Grid>

        <Box>
          <Heading size="md" mb={4}>
            Recently posted jobs
          </Heading>
          {loading ? (
            <Flex justify="center" py={4}>
              <Spinner size="sm" color="purple.500" />
            </Flex>
          ) : recentJobs.length > 0 ? (
            <Box position="relative">
              {/* Continuous vertical line */}
              <Box
                position="absolute"
                left="2px"
                top="6px"
                bottom="6px"
                w="0.5px"
                bg="gray.200"
              />
              {recentJobs.map((job, index) => (
                <Box key={job.job_id}>
                  <Box
                    py={2}
                    position="relative"
                    as={Link}
                    to={`/job-candidates/${job.job_id}`}
                    _hover={{ opacity: 0.7 }}
                    cursor="pointer"
                  >
                    <HStack spacing={2} align="center">
                      <Box position="relative">
                        <Box w="6px" h="6px" bg="gray.900" borderRadius="full" zIndex={1} position="relative" />
                      </Box>
                      <VStack spacing={0.5} align="start">
                        <Text fontSize="sm" color="gray.900">
                          {job.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatTimeAgo(job.created_at)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  {index < recentJobs.length - 1 && <Box h="16px" />}
                </Box>
              ))}
            </Box>
          ) : (
            <Text color="gray.500" fontSize="sm">
              No jobs posted yet. <Link to="/create-job" style={{ color: '#9C6CFE', textDecoration: 'underline' }}>Create your first job</Link>
            </Text>
          )}
        </Box>

        <Box>
          <Heading size="md" mb={6}>
            Featured resources
          </Heading>
          <Box maxW="800px">
            <FeaturedResource
              title="Unlimited job posts"
              description="Post as many jobs as you want for free"
              isNew
              actionText="Get started"
              to="/create-job"
              image={UnlimitedJobsImage}
            />
            <FeaturedResource
              title="View All Job Listings"
              description="Browse all your posted jobs and manage candidates"
              actionText="View jobs"
              to="/jobs"
              image={RemoteHiringImage}
            />
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
