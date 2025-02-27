import { Box, Button, Container, Input, Text, VStack, Flex, HStack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedLogo } from '../components/AnimatedLogo'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Add authentication logic here
    navigate('/chat')
  }

  return (
    <>
      <Box p={4}>
        <HStack spacing={2} align="center">
          <AnimatedLogo size={24} />
          <Text fontSize="xl" fontWeight="bold">
            Neunet
          </Text>
        </HStack>
      </Box>
      <Container maxW="container.sm" py={16}>
        <VStack spacing={8} align="stretch">
          <Text fontSize="3xl" fontWeight="bold" textAlign="center">
            Welcome to Neunet
          </Text>
          <Box as="form" onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  _focus={{ borderColor: '#9C6CFE' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  _focus={{ borderColor: '#9C6CFE' }}
                />
              </FormControl>
              <Button
                type="submit"
                bg="#9C6CFE"
                color="white"
                _hover={{ bg: '#8A5EE3' }}
                size="lg"
                width="full"
                mt={4}
              >
                Log In
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </>
  )
}
