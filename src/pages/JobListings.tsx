import {
  Box,
  Container,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

interface JobCardProps {
  title: string
  jobId: string
  applicants: number
}

const JobCard = ({ title, jobId, applicants }: JobCardProps) => (
  <Box
    as={RouterLink}
    to={`/job-candidates/${jobId}`}
    p={6}
    borderWidth={1}
    borderRadius="lg"
    _hover={{ bg: 'rgba(156, 108, 254, 0.05)' }}
    width="full"
  >
    <HStack justify="space-between">
      <VStack align="start" spacing={1}>
        <Text fontSize="lg" fontWeight="medium">
          {title}
        </Text>
        <Text color="gray.600" fontSize="sm">
          Job ID: {jobId}
        </Text>
      </VStack>
      <VStack align="end" spacing={1}>
        <Text color="#9C6CFE" fontWeight="medium">
          {applicants} Candidates
        </Text>
        <Text color="gray.600" fontSize="sm">
          Applied
        </Text>
      </VStack>
    </HStack>
  </Box>
)

export const JobListings = () => {
  const activeJobs = [
    {
      title: 'Senior Frontend Developer',
      jobId: 'FE-2025-001',
      applicants: 12,
    },
    {
      title: 'Backend Engineer',
      jobId: 'BE-2025-002',
      applicants: 8,
    },
  ]

  const closedJobs = [
    {
      title: 'UI/UX Designer',
      jobId: 'DS-2024-001',
      applicants: 15,
    },
  ]

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={6}>
        Jobs
      </Heading>

      <Tabs>
        <TabList mb={6}>
          <Tab _selected={{ color: '#9C6CFE', borderColor: '#9C6CFE' }}>Active Jobs</Tab>
          <Tab _selected={{ color: '#9C6CFE', borderColor: '#9C6CFE' }}>Closed Jobs</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {activeJobs.map((job) => (
                <JobCard key={job.jobId} {...job} />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {closedJobs.map((job) => (
                <JobCard key={job.jobId} {...job} />
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}
