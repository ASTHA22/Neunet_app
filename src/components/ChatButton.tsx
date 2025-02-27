import { Button, Icon } from '@chakra-ui/react'
import { FiMessageSquare } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export const ChatButton = () => {
  return (
    <Button
      as={Link}
      to="/chat"
      position="fixed"
      top={4}
      right={4}
      leftIcon={<Icon as={FiMessageSquare} />}
      bg="#9C6CFE"
      color="white"
      _hover={{ bg: '#8A5EE3' }}
      variant="solid"
      size="md"
      zIndex={1000}
    >
      Chat
    </Button>
  )
}
