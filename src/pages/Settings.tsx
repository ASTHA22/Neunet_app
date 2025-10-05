import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Switch,
  Badge,
} from '@chakra-ui/react'
import { FiUser, FiBell, FiLock, FiGlobe, FiMail } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { getUserSettings, updateUserSettings } from '../services/api'
import { authService } from '../services/authService'

interface SettingSectionProps {
  icon: any
  title: string
  description: string
  children: React.ReactNode
}

const SettingSection = ({ icon, title, description, children }: SettingSectionProps) => (
  <Box>
    <HStack spacing={3} mb={4}>
      <Icon as={icon} boxSize={5} color="purple.500" />
      <Box>
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" color="gray.600">{description}</Text>
      </Box>
    </HStack>
    <Box pl={8}>
      {children}
    </Box>
  </Box>
)

export const Settings = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Get logged-in user from authService
  const currentUser = authService.getUser()
  const userEmail = currentUser?.email || ''
  
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      if (!userEmail) {
        toast({
          title: 'Not logged in',
          description: 'Please log in to view settings.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        setLoading(false)
        return
      }

      try {
        const settings = await getUserSettings(userEmail)
        setName(currentUser?.name || '')
        setUsername(currentUser?.username || '')
        setContactEmail(settings.email || userEmail) // Auto-populate from logged-in user
      } catch (error) {
        console.error('Error loading settings:', error)
        // Auto-populate email even if settings fetch fails
        setContactEmail(userEmail)
        toast({
          title: 'Error loading settings',
          description: 'Could not load your settings. Using defaults.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [userEmail, toast])

  const handleSave = async () => {
    // Validate passwords if user is trying to change password
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        toast({
          title: 'Current password required',
          description: 'Please enter your current password to change it.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      if (newPassword !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          description: 'New password and confirm password must match.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      if (newPassword.length < 6) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 6 characters.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
    }

    setSaving(true)
    try {
      await updateUserSettings(userEmail, {})
      toast({
        title: 'Settings saved',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      // Clear password fields after successful save
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'Could not save your settings. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box py={8} px={8} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={3}>
          <Text>Loading settings...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box py={8} px={8} maxW="900px">
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Settings</Heading>
          <Text color="gray.600">Manage your account preferences and notifications</Text>
        </Box>

        {/* Profile Settings */}
        <SettingSection
          icon={FiUser}
          title="Profile Information"
          description="Your account details"
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm">Name</FormLabel>
              <Input 
                placeholder="Your name" 
                value={name}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Username</FormLabel>
              <Input 
                placeholder="Your username" 
                value={username}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Email</FormLabel>
              <Input 
                type="email" 
                placeholder="your@email.com"
                value={contactEmail}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
          </VStack>
        </SettingSection>

        <Divider />

        {/* Change Password */}
        <SettingSection
          icon={FiLock}
          title="Change Password"
          description="Update your password"
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm">Current Password</FormLabel>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">New Password</FormLabel>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Confirm New Password</FormLabel>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
          </VStack>
        </SettingSection>

        <Divider />

        {/* Save Button */}
        <HStack justify="flex-end" pt={4}>
          <Button variant="ghost" isDisabled={saving}>Cancel</Button>
          <Button colorScheme="purple" onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
