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
  CardBody
} from '@chakra-ui/react'
import { FiArrowLeft, FiGithub, FiDownload } from 'react-icons/fi'
import { SiLinkedin } from 'react-icons/si'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'

interface CandidateCardProps {
  id: string
  jobId: string
  name: string
  role: string
  score: number
}

const CandidateCard = ({ id, jobId, name, role, score }: CandidateCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Box>
      <Flex 
        py={4} 
        align="center"
        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
        borderRadius="md"
        onClick={() => navigate(`/job-candidates/${jobId}/candidate/${id}`)}
      >
        <Avatar size="md" name={name} mr={4} />
        <Box flex={1}>
          <Text fontWeight="medium">{name}</Text>
          <Text color="gray.600" fontSize="sm">{role}</Text>
        </Box>
        <HStack spacing={6} align="center">
          <Box textAlign="right">
            <Text color="#9C6CFE" fontSize="xl" fontWeight="bold">
              {score}
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
  const { jobId } = useParams()
  
  const candidates = [
    { id: '1', name: 'Sarah Anderson', role: 'Frontend Developer', score: 94 },
    { id: '2', name: 'Michael Chen', role: 'Frontend Developer', score: 89 }
  ]

  return (
    <Box pl="160px" pr="120px" py={8}>
      <Button
        as={RouterLink}
        to="/job-listings"
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        color="gray.600"
        mb={6}
      >
        Back to Jobs
      </Button>

      <Flex justify="space-between" align="center" mb={8}>
        <HStack spacing={4}>
          <Heading size="lg">Frontend Developer Position</Heading>
        </HStack>
        <HStack spacing={4}>
          <Select placeholder="Sort by Score" w="200px">
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </Select>
          <Button 
            bg="#9C6CFE"
            color="white"
            size="md"
            _hover={{ bg: '#8A5EE3' }}
          >Export List</Button>
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={12}>
        <StatBox label="Total Candidates" value="124" />
        <StatBox label="Average Score" value="85.4" />
        <StatBox label="Shortlisted" value="28" />
        <StatBox label="Rejected" value="12" />
      </Grid>

      <Box>
        <Text fontWeight="medium" fontSize="lg" mb={4}>
          Applied Candidates
        </Text>
        <Box>
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              id={candidate.id}
              jobId={jobId || ''}
              name={candidate.name}
              role={candidate.role}
              score={candidate.score}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
