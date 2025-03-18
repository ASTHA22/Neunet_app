import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Textarea,
  useToast,
  Select,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';

interface JobFormData {
  title: string
  location: string
  job_type: string
  description: string
  requirements: string
  responsibilities: string
  salary_range: string
  tech_stack: string
  growth_opportunities: string
}

const initialFormData: JobFormData = {
  title: '',
  location: '',
  job_type: '',
  description: '',
  requirements: '',
  responsibilities: '',
  salary_range: '',
  tech_stack: '',
  growth_opportunities: '',
}

export const CreateJob = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = React.useState<JobFormData>(initialFormData)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const jobData = {
        title: formData.title,
        location: formData.location,
        job_type: formData.job_type,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        salary_range: formData.salary_range,
        tech_stack: formData.tech_stack,
        growth_opportunities: formData.growth_opportunities,
      };

      const response = await createJob(jobData);
      toast({
        title: 'Job Created',
        description: `Job successfully created with ID: ${response.job_id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to create job. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Create New Job</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Job Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Senior Software Engineer"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., San Francisco, CA"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Job Type</FormLabel>
            <Select
              name="job_type"
              value={formData.job_type}
              onChange={handleInputChange}
              placeholder="Select job type"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter job description"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Requirements</FormLabel>
            <Textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="Enter job requirements"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Responsibilities</FormLabel>
            <Textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              placeholder="Enter job responsibilities"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Salary Range</FormLabel>
            <Input
              name="salary_range"
              value={formData.salary_range}
              onChange={handleInputChange}
              placeholder="e.g., $100k-$150k"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Tech Stack</FormLabel>
            <Input
              name="tech_stack"
              value={formData.tech_stack}
              onChange={handleInputChange}
              placeholder="e.g., React, Node.js, Python"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Growth Opportunities</FormLabel>
            <Textarea
              name="growth_opportunities"
              value={formData.growth_opportunities}
              onChange={handleInputChange}
              placeholder="Describe growth and advancement opportunities"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="purple"
            size="lg"
            isLoading={isSubmitting}
          >
            Create Job
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
