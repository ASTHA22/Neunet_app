import React, { useState, useEffect } from 'react';
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
  Flex,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createJob, generateJobDescription } from '../services/api';
import { FiZap } from 'react-icons/fi';
import { FaLinkedin, FaRegNewspaper } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GradientButton = styled(motion.button)`
  background: linear-gradient(45deg, #FF69B4, #9C6CFE, #FF1493);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 3s ease infinite;
  color: white;
  padding: 8px 16px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(156, 108, 254, 0.2);
  &:hover {
    box-shadow: 0 6px 20px rgba(156, 108, 254, 0.3);
  }
`;

// Export JobFormData so it can be imported in Chat.tsx
export interface JobFormData {
  title: string
  company_name: string
  location: string
  job_type: string
  description: string
  requirements: string
  responsibilities: string
  salary_range: string
  tech_stack: string
  growth_opportunities: string
  benefits: string
  about_company: string
  job_level: string
  time_commitment: string
}

const initialFormData: JobFormData = {
  title: '',
  company_name: '',
  location: '',
  job_type: '',
  description: '',
  requirements: '',
  responsibilities: '',
  salary_range: '',
  tech_stack: '',
  growth_opportunities: '',
  benefits: '',
  about_company: '',
  job_level: '',
  time_commitment: '',
}

export const CreateJob = ({ globalFormData, setGlobalFormData }: { globalFormData: JobFormData | null, setGlobalFormData: (data: JobFormData) => void }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(globalFormData || initialFormData);

  useEffect(() => {
    if (globalFormData) setFormData(globalFormData);
  }, [globalFormData]);

  useEffect(() => {
    setGlobalFormData(formData);
  }, [formData, setGlobalFormData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const jobData = {
        title: formData.title,
        company_name: formData.company_name,
        location: formData.location,
        job_type: formData.job_type,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        salary_range: formData.salary_range,
        tech_stack: formData.tech_stack,
        growth_opportunities: formData.growth_opportunities,
        benefits: formData.benefits,
        about_company: formData.about_company,
        job_level: formData.job_level,
        time_commitment: formData.time_commitment,
      };

      const response = await createJob(jobData);
      toast({
        title: 'Job Created',
        description: `Job successfully created with ID: ${response.job_id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData(initialFormData);
      setGlobalFormData(initialFormData);
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

  const handleGenerateAIInline = async () => {
    setIsGenerating(true);
    try {
      const aiResult = await generateJobDescription({
        title: formData.title,
        company_name: formData.company_name,
        location: formData.location,
        job_type: formData.job_type,
        description: formData.description,
      });
      setFormData(prev => ({
        ...prev,
        title: aiResult.job_title || prev.title,
        company_name: aiResult.company_name || prev.company_name,
        location: aiResult.location || prev.location,
        job_type: aiResult.job_type || prev.job_type,
        description: aiResult.about_the_role || aiResult.description || aiResult.job_description || prev.description,
        requirements: aiResult.qualifications ? aiResult.qualifications.join('\n') : (aiResult.skills_and_competencies ? aiResult.skills_and_competencies.join('\n') : prev.requirements),
        responsibilities: aiResult.key_responsibilities ? aiResult.key_responsibilities.join('\n') : prev.responsibilities,
        salary_range: aiResult.salary_range || aiResult.estimated_pay_range || prev.salary_range,
        tech_stack: aiResult.skills_and_competencies ? aiResult.skills_and_competencies.join(', ') : prev.tech_stack,
        growth_opportunities: aiResult.growth_opportunities || prev.growth_opportunities,
        benefits: aiResult.benefits ? aiResult.benefits.join('\n') : prev.benefits,
        about_company: aiResult.about_company || (aiResult.company_name ? `${aiResult.company_name} is a leading company in its field.` : prev.about_company),
        job_level: aiResult.job_level || prev.job_level,
        time_commitment: aiResult.time_commitment || prev.time_commitment,
      }));
      toast({ title: 'AI generated job description!', status: 'success', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: 'AI failed to generate description', status: 'error', duration: 2000, isClosable: true });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box p={8}>
      <Box mb={6}>
        <Flex align="center" gap={2} mb={2}>
          <Heading size="lg">Create Job</Heading>
          <GradientButton
            onClick={handleGenerateAIInline}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginLeft: 8 }}
            disabled={isGenerating}
          >
            <FiZap size={20} color="white" />
            <Text>Generate with AI</Text>
          </GradientButton>
          <Button
            variant="ghost"
            size="sm"
            ml={2}
            color="gray.500"
            onClick={() => {
              setFormData(initialFormData);
              setGlobalFormData(initialFormData);
            }}
          >
            Reset
          </Button>
        </Flex>
        <Text fontSize="sm" color="gray.500">
          Fill in job title, company name, location & job type — let AI handle the rest
        </Text>
      </Box>
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
            <FormLabel>Company Name</FormLabel>
            <Input
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="e.g., Neunet"
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
              placeholder="Enter job description or use AI to generate"
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

          <FormControl>
            <FormLabel>Benefits</FormLabel>
            <Textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              placeholder="e.g., Health insurance, Remote work, Learning budget"
            />
          </FormControl>

          <FormControl>
            <FormLabel>About the Company</FormLabel>
            <Textarea
              name="about_company"
              value={formData.about_company}
              onChange={handleInputChange}
              placeholder="e.g., Neunet is a leading AI company..."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Job Level</FormLabel>
            <Select
              name="job_level"
              value={formData.job_level}
              onChange={handleInputChange}
              placeholder="Select job level"
            >
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Time Commitment</FormLabel>
            <Input
              name="time_commitment"
              value={formData.time_commitment}
              onChange={handleInputChange}
              placeholder="e.g., Full-time, 40 hours/week"
            />
          </FormControl>

          <Flex align="center" mt={8} mb={2}>
            <Text fontSize="sm" color="gray.600" mr={2}>Post on:</Text>
            <FaLinkedin size={20} style={{ marginRight: 8, color: '#0A66C2' }} />
            <FaRegNewspaper size={20} style={{ color: '#374151' }} />
          </Flex>

          <Flex justify="flex-end" mt={2}>
            <Button
              type="submit"
              size="sm"
              color="#6C2EFF"
              bg="#F3E8FF"
              borderRadius="8px"
              px={6}
              fontWeight="medium"
              boxShadow="sm"
              _hover={{ bg: '#E9D5FF' }}
              _active={{ bg: '#A78BFA', color: 'white' }}
              isLoading={isSubmitting}
            >
              Save Job
            </Button>
          </Flex>
        </VStack>
      </form>
      <script>
        {`
          window.openChatWidget = function() {
            const chatBtn = document.querySelector('[aria-label="Chat"]');
            if (chatBtn) chatBtn.click();
          };
        `}
      </script>
    </Box>
  );
};
