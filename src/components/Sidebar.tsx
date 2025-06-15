import React from 'react';
import { Box, VStack, Icon, Text, Link as ChakraLink, Button, Flex } from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBriefcase, FiUsers, FiSettings, FiLogOut, FiMessageCircle, FiHelpCircle } from 'react-icons/fi';
import { AnimatedLogo } from './AnimatedLogo';

const SidebarLink = ({ to, icon, children }: { to: string; icon: any; children: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <ChakraLink
      as={Link}
      to={to}
      w="full"
      p={3}
      borderRadius="md"
      bg={isActive ? 'rgba(156, 108, 254, 0.1)' : 'transparent'}
      color={isActive ? '#9C6CFE' : 'gray.700'}
      _hover={{ bg: 'rgba(156, 108, 254, 0.05)', color: '#9C6CFE' }}
      display="flex"
      alignItems="center"
      gap={3}
      transition="all 0.2s"
    >
      <Icon as={icon} boxSize={5} />
      <Text fontWeight={isActive ? "medium" : "normal"}>{children}</Text>
    </ChakraLink>
  );
};

export const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here (clear tokens, etc.)
    navigate('/login');
  };

  return (
    <Flex
      as="nav"
      pos="fixed"
      h="100vh"
      w="250px"
      borderRight="1px"
      borderColor="gray.200"
      py={8}
      px={4}
      bg="bg.sidebar"
      flexDirection="column"
    >
      {/* Top section with logo and main navigation */}
      <VStack spacing={2} align="stretch">
        <Box fontSize="xl" fontWeight="bold" mb={8} px={3} color="gray.900" display="flex" alignItems="center" gap={2}>
          <AnimatedLogo />
          <Text>Neunet</Text>
        </Box>

        <VStack spacing={1} align="stretch">
          <SidebarLink to="/dashboard" icon={FiHome}>
            Home
          </SidebarLink>
          <SidebarLink to="/create-job" icon={FiBriefcase}>
            Create a job
          </SidebarLink>
          <SidebarLink to="/jobs" icon={FiUsers}>
            Job Listings
          </SidebarLink>
          <SidebarLink to="/settings" icon={FiSettings}>
            Settings
          </SidebarLink>
        </VStack>
      </VStack>

      {/* Bottom section with support links and logout */}
      <VStack mt="auto" spacing={1} align="stretch">
        <SidebarLink to="/feedback" icon={FiMessageCircle}>
          Feedback
        </SidebarLink>
        <SidebarLink to="/help" icon={FiHelpCircle}>
          Help and docs
        </SidebarLink>
        <Button
          leftIcon={<Icon as={FiLogOut} />}
          variant="ghost"
          color="gray.700"
          onClick={handleLogout}
          justifyContent="flex-start"
          px={3}
          mt={2}
          _hover={{ bg: 'rgba(156, 108, 254, 0.05)', color: '#9C6CFE' }}
        >
          Logout
        </Button>
      </VStack>
    </Flex>
  );
};
