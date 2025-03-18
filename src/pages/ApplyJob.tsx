import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Text,
  Container,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { applyForJob } from '../services/api';

export const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume: '',
    cover_letter: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;

    try {
      setIsSubmitting(true);
      await applyForJob(jobId, formData);
      
      toast({
        title: 'Application Submitted',
        description: 'Your job application has been submitted successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back to job listings to see updated candidate count
      navigate('/jobs');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Submit Your Application</Heading>
          <Text color="gray.600">Job ID: {jobId}</Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Resume</FormLabel>
                <Textarea
                  name="resume"
                  value={formData.resume}
                  onChange={handleChange}
                  placeholder="Paste your resume content here"
                  minH="200px"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Cover Letter (Optional)</FormLabel>
                <Textarea
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleChange}
                  placeholder="Write your cover letter here"
                  minH="150px"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Submit Application
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};
