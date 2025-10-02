import React from 'react';
import { Box, Text, VStack, HStack, Button, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
import { AnimatedLogo } from './AnimatedLogo';

const features = [
  'AI-powered chat for hiring',
  'Instant candidate screening',
  'Generate job descriptions',
  'Get candidate insights',
  'Seamless team collaboration',
  'Automated interview scheduling',
  'Smart analytics dashboard',
  'Integrates with your ATS',
  'Customizable workflows',
];

function useTypewriter(texts: string[], speed = 60, pause = 1000) {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    if (!deleting && subIndex < texts[index].length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayed(texts[index].slice(0, subIndex + 1));
        setSubIndex(subIndex + 1);
      }, speed);
    } else if (!deleting && subIndex === texts[index].length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && subIndex > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplayed(texts[index].slice(0, subIndex - 1));
        setSubIndex(subIndex - 1);
      }, speed / 2);
    } else if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }
  }, [subIndex, index, deleting, texts, speed, pause]);

  return displayed;
}

export const LandingHero = () => {
  const autofillText = useTypewriter(features, 60, 1400);
  const bgGradient = useColorModeValue(
    'linear(to-b, #f3e5ff 0%, #e1bee7 40%, #ce93d8 100%)',
    'linear(to-b, #9c64a6 0%, #8e24aa 60%, #7b1fa2 100%)'
  );

  return (
    <VStack 
      spacing={8} 
      w="full" 
      align="center" 
      justify="center" 
      minH="60vh" 
      py={16}
      bg={bgGradient}
    >
        <HStack spacing={3}>
          <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="extrabold" display="flex" alignItems="center" color="purple.700">
            Hire with <span style={{ margin: '0 0.5rem', display: 'inline-flex', verticalAlign: 'middle' }}><AnimatedLogo size={28} /></span> Neunet
          </Text>
        </HStack>
        <Text fontSize={{ base: 'xl', md: '2xl' }} color={useColorModeValue('purple.800', 'purple.200')} textAlign="center" maxW="lg">
          Create jobs and manage hiring with AI
        </Text>
        <HStack 
          w={{ base: 'full', md: 'lg' }}
          bg={useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.1)')}
          borderRadius="xl"
          px={2}
          py={2}
          backdropFilter="blur(10px)"
          boxShadow="md"
        >
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color={useColorModeValue('gray.600', 'gray.300')}
            fontFamily="mono"
            minH="28px"
            transition="all 0.2s"
            flex="1"
            px={4}
            py={2}
          >
            {autofillText || '\u00A0'}
          </Text>
          <IconButton
            icon={<FiSend />}
            aria-label="Send message"
            size="sm"
            bg={useColorModeValue('purple.400', 'purple.300')}
            color="white"
            _hover={{ bg: useColorModeValue('purple.500', 'purple.200') }}
            variant="solid"
          />
        </HStack>
      </VStack>
  );
};
