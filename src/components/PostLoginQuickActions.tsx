import { SimpleGrid, Box, Icon, Text, ChakraLink, HStack } from '@chakra-ui/react';
import { FiBriefcase, FiUsers, FiEdit3, FiHelpCircle } from 'react-icons/fi';

interface QuickActionLinkProps {
  icon: any;
  title: string;
  description: string;
  action: string;
  iconColor?: string;
  onAction: (action: string) => void;
}

const QuickActionLink = ({ icon, title, description, action, iconColor, onAction }: QuickActionLinkProps) => (
  <Box
    as="button"
    onClick={() => onAction(action)}
    display="block"
    p={4}
    bg="white"
    borderRadius="lg"
    _hover={{ bg: 'gray.50' }}
    w="full"
    h="full"
    boxShadow="sm"
    border="none"
    textAlign="left"
  >
    <HStack spacing={3} align="flex-start">
      <Box color={iconColor || 'brand.500'} mt={1}>
        <Icon as={icon} boxSize={4} />
      </Box>
      <Box>
        <Text fontWeight="medium" fontSize="md" mb={0.5}>
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {description}
        </Text>
      </Box>
    </HStack>
  </Box>
);

export const PostLoginQuickActions = ({ onAction }: { onAction: (action: string) => void }) => {
  return (
    <SimpleGrid columns={2} spacing={4} mb={4}>
      <QuickActionLink
        icon={FiBriefcase}
        title="View my jobs"
        description="See your job postings"
        action="view_my_jobs"
        iconColor="green.500"
        onAction={onAction}
      />
      <QuickActionLink
        icon={FiUsers}
        title="Show all candidates"
        description="Browse all candidates"
        action="show_all_candidates"
        iconColor="purple.500"
        onAction={onAction}
      />
      <QuickActionLink
        icon={FiEdit3}
        title="Create new job"
        description="Post a new job opening"
        action="create_new_job"
        iconColor="purple.400"
        onAction={onAction}
      />
      <QuickActionLink
        icon={FiHelpCircle}
        title="Help / FAQ"
        description="Get assistance and answers"
        action="help_faq"
        iconColor="orange.500"
        onAction={onAction}
      />
    </SimpleGrid>
  );
};
