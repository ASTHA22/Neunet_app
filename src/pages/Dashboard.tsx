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
} from '@chakra-ui/react'
import { FiArrowRight, FiCalendar, FiSearch, FiUser, FiArrowUpRight, FiBriefcase } from 'react-icons/fi'
import { Link } from 'react-router-dom'
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
            title="Find candidates"
            to="/candidates"
          />
          <QuickAction
            icon={FiUser}
            title="Candidate Details"
            to="/candidate-details"
          />
          <QuickAction
            icon={FiCalendar}
            title="Schedule an interview"
            to="/schedule"
          />
          <QuickAction
            icon={FiArrowRight}
            title="Explore more features"
            to="/features"
          />
        </Grid>

        <Box>
          <Heading size="md" mb={4}>
            Recent activity
          </Heading>
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
            <RecentActivity
              title="Product Designer"
              date="2 days ago"
            />
            <RecentActivity
              title="Senior Software Engineer"
              date="4 days ago"
            />
          </Box>
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
              title="Remote Hiring Guide"
              description="How to find, interview, and hire remote talent"
              isNew
              actionText="Read the guide"
              to="/guide"
              image={RemoteHiringImage}
            />
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
