import { Box, Button, Container, Input, Text, VStack, Flex, HStack, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Select, useToast } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react';
import { AnimatedLogo } from '../components/AnimatedLogo'
import { LandingHero } from '../components/LandingHero'
import { authService } from '../services/authService'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  
  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false)
  const [isVerifyIdentityModalOpen, setIsVerifyIdentityModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Signup form state
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [companySize, setCompanySize] = useState('')
  
  // Forgot password form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  
  // Verify identity reset form state
  const [verifyUsername, setVerifyUsername] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyName, setVerifyName] = useState('')
  const [verifyNewPassword, setVerifyNewPassword] = useState('')
  const [verifyConfirmPassword, setVerifyConfirmPassword] = useState('')
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await authService.login({
        email: loginEmail,
        password: loginPassword
      })
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      setIsLoginModalOpen(false)
      navigate('/chat')
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await authService.signup({
        name: signupName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        company_size: companySize
      })
      
      toast({
        title: 'Account created',
        description: 'Welcome to Neunet!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      setIsSignupModalOpen(false)
      navigate('/chat')
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Failed to create account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await authService.forgotPassword({
        email: forgotPasswordEmail
      })
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for password reset instructions',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      setIsForgotPasswordModalOpen(false)
      setForgotPasswordEmail('')
    } catch (error: any) {
      toast({
        title: 'Failed to send reset email',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleVerifyIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (verifyNewPassword !== verifyConfirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    
    if (verifyNewPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      await authService.resetPasswordVerifyIdentity({
        username: verifyUsername,
        email: verifyEmail,
        name: verifyName,
        new_password: verifyNewPassword
      })
      
      toast({
        title: 'Password reset successful',
        description: 'You can now log in with your new password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      setIsVerifyIdentityModalOpen(false)
      setVerifyUsername('')
      setVerifyEmail('')
      setVerifyName('')
      setVerifyNewPassword('')
      setVerifyConfirmPassword('')
      setIsLoginModalOpen(true)
    } catch (error: any) {
      toast({
        title: 'Identity verification failed',
        description: error.message || 'Please check your information and try again',
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
        <HStack spacing={4}>
          <Button variant="ghost" colorScheme="gray" onClick={() => setIsLoginModalOpen(true)} border="1px" borderColor={useColorModeValue('gray.300', 'gray.600')}>Log in</Button>
          <Button bg={useColorModeValue('purple.400', 'purple.300')} color="white" _hover={{ bg: useColorModeValue('purple.500', 'purple.200') }} variant="solid" fontWeight="bold" onClick={() => setIsSignupModalOpen(true)}>Get started</Button>
        </HStack>
      </Flex>
      <Container maxW="container.lg" py={16}>
        <VStack spacing={8} align="stretch">
          <LandingHero />
          
          {/* Demo Video Section */}
          <Box 
            mt={12} 
            borderRadius="xl" 
            overflow="hidden" 
            boxShadow="2xl"
            bg="white"
            p={2}
          >
            <video
              controls
              style={{
                width: '100%',
                borderRadius: '8px',
                display: 'block'
              }}
            >
              <source src="/demo-video.mov" type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      </Container>
      
      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log In</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleLoginSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    placeholder="Enter your password"
                  />
                </FormControl>
                <Box w="full" textAlign="right">
                  <Button 
                    variant="link" 
                    colorScheme="purple" 
                    size="sm"
                    onClick={() => {
                      setIsLoginModalOpen(false)
                      setIsForgotPasswordModalOpen(true)
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
                <Button 
                  type="submit" 
                  bg={useColorModeValue('purple.400', 'purple.300')} 
                  color="white" 
                  _hover={{ bg: useColorModeValue('purple.500', 'purple.200') }} 
                  w="full"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                >
                  Log In
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Signup Modal */}
      <Modal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Get Started</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSignupSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    type="text" 
                    value={signupName} 
                    onChange={(e) => setSignupName(e.target.value)} 
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input 
                    type="text" 
                    value={signupUsername} 
                    onChange={(e) => setSignupUsername(e.target.value)} 
                    placeholder="Choose a username"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    value={signupPassword} 
                    onChange={(e) => setSignupPassword(e.target.value)} 
                    placeholder="Create a password"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Company Size</FormLabel>
                  <Select 
                    value={companySize} 
                    onChange={(e) => setCompanySize(e.target.value)} 
                    placeholder="Select company size"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51+">51+ employees</option>
                  </Select>
                </FormControl>
                <Button 
                  type="submit" 
                  bg={useColorModeValue('purple.400', 'purple.300')} 
                  color="white" 
                  _hover={{ bg: useColorModeValue('purple.500', 'purple.200') }} 
                  w="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Get Started
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Forgot Password Modal */}
      <Modal isOpen={isForgotPasswordModalOpen} onClose={() => setIsForgotPasswordModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleForgotPasswordSubmit}>
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Enter your email address and we'll send you instructions to reset your password.
                </Text>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    value={forgotPasswordEmail} 
                    onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                    placeholder="Enter your email"
                  />
                </FormControl>
                <Button 
                  type="submit" 
                  bg={useColorModeValue('purple.400', 'purple.300')} 
                  color="white" 
                  _hover={{ bg: useColorModeValue('purple.500', 'purple.200') }} 
                  w="full"
                  isLoading={isLoading}
                  loadingText="Sending..."
                >
                  Send Reset Link
                </Button>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Or
                </Text>
                <Button 
                  variant="outline" 
                  colorScheme="purple" 
                  size="sm"
                  w="full"
                  onClick={() => {
                    setIsForgotPasswordModalOpen(false)
                    setIsVerifyIdentityModalOpen(true)
                  }}
                >
                  Reset without Email Access
                </Button>
                <Button 
                  variant="link" 
                  colorScheme="purple" 
                  size="sm"
                  onClick={() => {
                    setIsForgotPasswordModalOpen(false)
                    setIsLoginModalOpen(true)
                  }}
                >
                  Back to Login
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Verify Identity Reset Password Modal */}
      <Modal isOpen={isVerifyIdentityModalOpen} onClose={() => setIsVerifyIdentityModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Password - Verify Identity</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleVerifyIdentitySubmit}>
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Verify your identity by providing your account information, then set a new password.
                </Text>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input 
                    type="text" 
                    value={verifyUsername} 
                    onChange={(e) => setVerifyUsername(e.target.value)} 
                    placeholder="Enter your username"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    value={verifyEmail} 
                    onChange={(e) => setVerifyEmail(e.target.value)} 
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    type="text" 
                    value={verifyName} 
                    onChange={(e) => setVerifyName(e.target.value)} 
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <Input 
                    type="password" 
                    value={verifyNewPassword} 
                    onChange={(e) => setVerifyNewPassword(e.target.value)} 
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
                    value={verifyConfirmPassword} 
                    onChange={(e) => setVerifyConfirmPassword(e.target.value)} 
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
                  loadingText="Verifying..."
                >
                  Verify & Reset Password
                </Button>
                <Button 
                  variant="link" 
                  colorScheme="purple" 
                  size="sm"
                  onClick={() => {
                    setIsVerifyIdentityModalOpen(false)
                    setIsForgotPasswordModalOpen(true)
                  }}
                >
                  Back to Email Reset
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
