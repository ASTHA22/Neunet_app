import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
  Select,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { submitFeedback } from '../services/api'

export const Feedback = () => {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  
  // Get logged-in user
  const currentUser = authService.getUser()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')

  // Auto-populate name and email from logged-in user
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setEmail(currentUser.email || '')
    }
  }, [currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSubmitting(true)
    
    try {
      await submitFeedback({ email, category, message })
      
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback! We\'ll review it shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      // Clear only the message and reset category
      setCategory('general')
      setMessage('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box py={8} px={8} maxW="700px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Feedback</Heading>
          <Text color="gray.600">
            We'd love to hear from you! Share your thoughts, suggestions, or report issues.
          </Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="md"
        >
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Name</FormLabel>
              <Input
                placeholder="Your name"
                value={name}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Email</FormLabel>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Category</FormLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Message</FormLabel>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                resize="vertical"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              isLoading={submitting}
              loadingText="Submitting..."
            >
              Submit Feedback
            </Button>
          </VStack>
        </Box>

        <Box bg="purple.50" p={4} borderRadius="md">
          <Text fontSize="sm" color="gray.700">
            <strong>Note:</strong> Your feedback helps us improve Neunet. 
            We review all submissions and may reach out to you via email if we need more information.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
