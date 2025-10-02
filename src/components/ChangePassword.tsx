import { Box, Button, Input, Text, VStack, useColorModeValue, useToast } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useState } from 'react'
import React from 'react'
import { authService } from '../services/authService'

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (currentPassword === newPassword) {
      toast({
        title: 'Same password',
        description: 'New password must be different from current password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    
    try {
      await authService.updatePassword({
        current_password: currentPassword,
        new_password: newPassword
      })
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: 'Failed to update password',
        description: error.message || 'Please check your current password and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box 
      bg={useColorModeValue('white', 'gray.800')} 
      p={6} 
      borderRadius="lg" 
      boxShadow="md"
      maxW="md"
    >
      <VStack spacing={6} align="stretch">
        <VStack spacing={1} align="start">
          <Text fontSize="xl" fontWeight="bold">
            Change Password
          </Text>
          <Text fontSize="sm" color="gray.600">
            Update your password to keep your account secure
          </Text>
        </VStack>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Current Password</FormLabel>
              <Input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                placeholder="Enter current password"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter new password"
                minLength={8}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Must be at least 8 characters
              </Text>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Confirm New Password</FormLabel>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password"
                minLength={8}
              />
            </FormControl>
            
            <Button 
              type="submit" 
              bg={useColorModeValue('purple.400', 'purple.300')} 
              color="white" 
              _hover={{ bg: useColorModeValue('purple.500', 'purple.200') }} 
              w="full"
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Password
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}
