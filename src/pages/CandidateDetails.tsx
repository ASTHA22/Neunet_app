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
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { BsGithub } from 'react-icons/bs'
import { FaLinkedin } from 'react-icons/fa'

interface Skill {
  name: string;
}

interface CandidateData {
  name: string;
  role: string;
  avatar: string;
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
}

export const CandidateDetails = () => {
  const { jobId } = useParams();
  
  // Mock data - replace with actual API call
  const candidate: CandidateData = {
    name: "Sarah Johnson",
    role: "Senior Frontend Developer",
    avatar: "",
    evaluation: {
      total: 92,
      technicalSkills: 94,
      problemSolving: 90,
      communication: 92
    },
    github: {
      totalCommits: 1234,
      repositories: 45,
      pullRequests: 89
    },
    skills: [
      { name: "React.js" },
      { name: "TypeScript" },
      { name: "Node.js" },
      { name: "GraphQL" },
      { name: "AWS" },
      { name: "Docker" }
    ]
  };

  return (
    <Box pl="160px" pr="120px" py={8}>
      <Button
        as={RouterLink}
        to={`/job-candidates/${jobId}`}
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        color="gray.600"
        mb={8}
      >
        Back to Candidates
      </Button>

      <Flex gap={4} mb={8}>
        <Avatar size="xl" name={candidate.name} />
        <Box>
          <Heading size="lg" mb={1}>{candidate.name}</Heading>
          <Text color="gray.600">{candidate.role}</Text>
        </Box>
      </Flex>

      <Flex gap={6} mb={8}>
        <Box 
          flex={1} 
          bg="green.50" 
          p={6} 
          borderRadius="lg"
        >
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            Evaluation Score
          </Text>
          
          <Text 
            fontSize="48px" 
            fontWeight="bold" 
            color="green.500"
            mb={4}
          >
            {candidate.evaluation.total}
          </Text>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text color="gray.600">Technical Skills</Text>
              <Text fontWeight="medium">{candidate.evaluation.technicalSkills}%</Text>
            </HStack>
            <HStack justify="space-between" mb={2}>
              <Text color="gray.600">Problem Solving</Text>
              <Text fontWeight="medium">{candidate.evaluation.problemSolving}%</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Communication</Text>
              <Text fontWeight="medium">{candidate.evaluation.communication}%</Text>
            </HStack>
          </Box>
        </Box>

        <Box 
          flex={1} 
          bg="gray.50" 
          p={6} 
          borderRadius="lg"
        >
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            GitHub Statistics
          </Text>
          
          <Box>
            <HStack justify="space-between" mb={4}>
              <Text color="gray.600">Total Commits</Text>
              <Text fontWeight="medium">{candidate.github.totalCommits}</Text>
            </HStack>
            <HStack justify="space-between" mb={4}>
              <Text color="gray.600">Repositories</Text>
              <Text fontWeight="medium">{candidate.github.repositories}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Pull Requests</Text>
              <Text fontWeight="medium">{candidate.github.pullRequests}</Text>
            </HStack>
          </Box>
        </Box>
      </Flex>

      <Box mb={8}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          Skills
        </Text>
        <Flex gap={2} flexWrap="wrap">
          {candidate.skills.map((skill) => (
            <Badge
              key={skill.name}
              px={3}
              py={1}
              bg="rgba(96, 122, 251, 0.1)"
              color="#9C6CFE"
              borderRadius="full"
            >
              {skill.name}
            </Badge>
          ))}
        </Flex>
      </Box>

      <HStack spacing={4}>
        <Button
          leftIcon={<Icon as={BsGithub} />}
          variant="outline"
          bg="white"
          color="#24292F"
          borderColor="#24292F"
          _hover={{
            bg: "#24292F",
            color: "white"
          }}
        >
          GitHub Profile
        </Button>
        <Button
          leftIcon={<Icon as={FaLinkedin} />}
          bg="#0A66C2"
          color="white"
          _hover={{
            bg: "#004182"
          }}
        >
          LinkedIn Profile
        </Button>
      </HStack>
    </Box>
  );
}
