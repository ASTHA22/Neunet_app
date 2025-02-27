import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Textarea,
  VStack,
  Text,
  HStack
} from '@chakra-ui/react'
import { SiLinkedin, SiIndeed } from 'react-icons/si'
import { useState } from 'react'

export const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    qualifications: '',
    additionalInfo: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <Box pl="300px" pr="40px" py={8}>
      <Box maxW="800px">
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Create a new opening</Heading>

            <FormControl isRequired>
              <FormLabel>Job title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter job title"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: '#7A0BC0' }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Job description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter job description"
                minH="150px"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: '#7A0BC0' }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Skills</FormLabel>
              <Input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Enter required skills"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: '#7A0BC0' }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Qualifications</FormLabel>
              <Input
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="Enter qualifications"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: '#7A0BC0' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Additional information</FormLabel>
              <Textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Enter additional information"
                minH="100px"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: '#7A0BC0' }}
              />
            </FormControl>

            <Box>
              <Text mb={2}>Post on:</Text>
              <HStack spacing={4}>
                <Button
                  size="sm"
                  leftIcon={<Icon as={SiLinkedin} boxSize={4} />}
                  bg="#0A66C2"
                  color="white"
                  _hover={{ bg: "#004182" }}
                  px={6}
                >
                  LinkedIn
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Icon as={SiIndeed} boxSize={4} />}
                  bg="#2164f3"
                  color="white"
                  _hover={{ bg: "#1951d4" }}
                  px={6}
                >
                  Indeed
                </Button>
              </HStack>
            </Box>

            <Button
              bg="#7A0BC0"
              color="white"
              _hover={{ bg: '#6c5ce7' }}
              type="submit"
              alignSelf="flex-end"
              size="md"
            >
              Save Job
            </Button>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}
