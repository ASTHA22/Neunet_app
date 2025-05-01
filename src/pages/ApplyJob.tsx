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
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { applyForJob } from '../services/api';

const API_URL =
  window.location.hostname !== 'localhost'
    ? 'https://neunet-ai-services.onrender.com'
    : 'http://localhost:8000';

import { ResumeData } from '../types/resume';

export const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    linkedIn: '',
    skills: '',
    education_degree: '',
    education_institute: '',
    experience_organization: '',
    experience_position: '',
    resume: '', // will store JSON stringified ResumeData
  });
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setIsParsing(false);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setIsParsing(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    try {
      const response = await fetch(`${API_URL}/api/parse-resume`, {
        method: 'POST',
        body: formDataObj,
      });
      const result = await response.json();
      if (result.success && result.data) {
        const data: ResumeData = result.data;
        setResumeData(data);
        // Phone number logic (support both camelCase and space keys)
        let phoneNumber = (data["phone number"] || data.phone_number || '').trim();
        if (!phoneNumber && (data["secondary phone number"] || data.secondary_phone_number)) {
          phoneNumber = (data["secondary phone number"] || data.secondary_phone_number || '').trim();
        }

        // Experience logic: support both 'work experience' and work_experience
        let workExpArr: any[] = data["work experience"] || data.work_experience || [];
        let currentExp: any = null;
        if (Array.isArray(workExpArr) && workExpArr.length > 0) {
          currentExp = workExpArr.find((exp: any) =>
            (exp["end date"] || exp.end || '').toLowerCase() === 'present'
          ) || workExpArr[0];
        }

        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone_number: phoneNumber,
          linkedIn: data.links?.linkedIn || '',
          skills: data.skills || '',
          education_degree: (data.education && data.education[0]?.degree) || (data["education"] && data["education"][0]?.degree) || '',
          education_institute: (data.education && data.education[0]?.institute) || (data["education"] && data["education"][0]?.institute) || '',
          experience_organization: currentExp?.organization || '',
          experience_position: currentExp?.position || '',
          resume: JSON.stringify(data),
        }));
        toast({
          title: 'Resume Parsed',
          description: 'Resume parsing successful! Please review and complete your application.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Parsing Failed',
          description: result.error || 'Could not parse the resume.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Could not connect to backend.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsParsing(false);
    }
  };

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
    if (!file) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume before submitting.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    try {
      setIsSubmitting(true);
      // Send all fields + file as multipart/form-data
      await applyForJob(jobId, {
        ...formData,
        resume: file,
      });
      toast({
        title: 'Application Submitted',
        description: 'Your job application has been submitted successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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
          <FormControl isRequired>
            <FormLabel>Upload Resume (PDF or DOCX)</FormLabel>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </FormControl>
          <Button
            colorScheme="purple"
            onClick={handleParse}
            isLoading={isParsing}
            loadingText="Parsing"
            disabled={!file}
          >
            Parse Resume
          </Button>
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
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </FormControl>
              <FormControl>
                <FormLabel>LinkedIn</FormLabel>
                <Input
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Skills</FormLabel>
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Comma-separated skills"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Education - Degree</FormLabel>
                <Input
                  name="education_degree"
                  value={formData.education_degree}
                  onChange={handleChange}
                  placeholder="Degree"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Education - Institute</FormLabel>
                <Input
                  name="education_institute"
                  value={formData.education_institute}
                  onChange={handleChange}
                  placeholder="Institute"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Current Organization</FormLabel>
                <Input
                  name="experience_organization"
                  value={formData.experience_organization}
                  onChange={handleChange}
                  placeholder="Current organization"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Current Position</FormLabel>
                <Input
                  name="experience_position"
                  value={formData.experience_position}
                  onChange={handleChange}
                  placeholder="Current position"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Submitting"
                disabled={isParsing}
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
