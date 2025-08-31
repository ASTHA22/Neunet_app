import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Container,
  Heading,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';

const API_URL =
  window.location.hostname !== 'localhost'
    ? 'https://api.neunet.io'
    : 'http://localhost:8000';

const ResumeParser: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setParsedData(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setIsLoading(true);
    setParsedData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/parse-resume`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setParsedData(result.data);
        toast({
          title: 'Resume Parsed',
          description: 'Resume parsing successful!',
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
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Resume Parser</Heading>
          <FormControl>
            <FormLabel>Upload Resume (PDF or DOCX)</FormLabel>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </FormControl>
          <Button
            colorScheme="purple"
            onClick={handleParse}
            isLoading={isLoading}
            loadingText="Parsing"
            disabled={!file}
          >
            Parse Resume
          </Button>
          {isLoading && <Spinner size="lg" alignSelf="center" />}
          {parsedData && (
            <Box mt={6} p={4} borderWidth={1} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.800')}>
              <Heading size="md" mb={2}>Extracted Resume Data</Heading>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(parsedData, null, 2)}</pre>
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  );
};

export default ResumeParser;
