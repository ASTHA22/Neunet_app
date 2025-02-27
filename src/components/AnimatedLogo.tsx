import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { Box } from '@chakra-ui/react'

interface AnimatedLogoProps {
  size?: number
  color?: string
}

export const AnimatedLogo = ({ size = 24, color = '#9C6CFE' }: AnimatedLogoProps) => {
  return (
    <Box position="relative" display="inline-block">
      {/* Main Logo */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <Icon 
          icon="fluent-emoji:robot" 
          style={{ 
            fontSize: size,
            color: color
          }} 
        />
      </motion.div>
      
      {/* Sparkle Effects */}
      <motion.div
        style={{
          position: 'absolute',
          top: -5,
          right: -5,
          width: 10,
          height: 10,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          borderRadius: '50%'
        }}
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1
        }}
      />
      
      <motion.div
        style={{
          position: 'absolute',
          bottom: -3,
          left: -3,
          width: 8,
          height: 8,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          borderRadius: '50%'
        }}
        animate={{
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          delay: 0.5
        }}
      />
    </Box>
  )
}
