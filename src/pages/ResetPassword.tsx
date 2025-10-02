import { Box, Button, Container, Input, Text, VStack, Flex, HStack, useColorModeValue, useToast } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import React from 'react'
import { AnimatedLogo } from '../components/AnimatedLogo'
import { authService } from '../services/authService'

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast({
        title: 'Invalid reset link',
        description: 'The password reset link is invalid or has expired',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      navigate('/')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, navigate, toast])

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

    if (!token) {
      toast({
        title: 'Invalid token',
        description: 'The reset token is missing',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    
    try {
      await authService.resetPassword({
        token: token,
        new_password: newPassword
      })
      
      toast({
        title: 'Password reset successful',
        description: 'You can now log in with your new password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: error.message || 'The reset link may have expired. Please request a new one.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" w="full" bgGradient={{
      base: 'linear(to-b, #e0e7ff 0%, #bfaaff 60%, #a18ffb 100%)',
      md: 'linear(to-b, #e0e7ff 0%, #bfaaff 60%, #a18ffb 100%)'
    }}>
      <Flex p={4} align="center" justify="space-between">
        <HStack spacing={2} align="center">
          <AnimatedLogo size={24} />
          <Text fontSize="xl" fontWeight="bold">
            Neunet
          </Text>
        </HStack>
        <Button 
          variant="ghost" 
          colorScheme="gray" 
          onClick={() => navigate('/')}
          border="1px" 
          borderColor={useColorModeValue('gray.300', 'gray.600')}
        >
          Back to Home
        </Button>
      </Flex>
      
      <Container maxW="md" py={16}>
        <Box 
          bg={useColorModeValue('white', 'gray.800')} 
          p={8} 
          borderRadius="lg" 
          boxShadow="xl"
        >
          <VStack spacing={6} align="stretch">
            <VStack spacing={2}>
              <Text fontSize="2xl" fontWeight="bold">
                Reset Your Password
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Enter your new password below
              </Text>
            </VStack>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
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
                  <FormLabel>Confirm Password</FormLabel>
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
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Resetting password..."
                >
                  Reset Password
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}
