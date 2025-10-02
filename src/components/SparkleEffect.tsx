import React from 'react';
import { Box, keyframes } from '@chakra-ui/react';

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const Sparkle = ({ x, y, delay, size = 4 }) => {
  return (
    <Box
      position="absolute"
      left={`${x}%`}
      top={`${y}%`}
      w={`${size}px`}
      h={`${size}px`}
      bg="white"
      borderRadius="50%"
      animation={`${sparkle} 3s ease-in-out ${delay}s infinite`}
      style={{
        boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
      }}
    />
  );
};

export const SparkleEffect = () => {
  const sparkles = [
    { x: 10, y: 20, delay: 0 },
    { x: 85, y: 15, delay: 0.5 },
    { x: 20, y: 80, delay: 1 },
    { x: 90, y: 70, delay: 1.5 },
    { x: 50, y: 10, delay: 2 },
    { x: 15, y: 50, delay: 2.5 },
    { x: 80, y: 85, delay: 3 },
    { x: 60, y: 90, delay: 3.5 },
  ];

  return (
    <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
      {sparkles.map((sparkle, index) => (
        <Sparkle key={index} {...sparkle} />
      ))}
    </Box>
  );
};
