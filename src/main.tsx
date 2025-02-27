import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  fonts: {
    heading: `'Manrope', sans-serif`,
    body: `'Manrope', sans-serif`,
  },
  colors: {
    brand: {
      50: '#EEF0FF',
      100: '#D8DEFF',
      200: '#B5BFFF',
      300: '#8E9CFF',
      400: '#7387FF',
      500: '#617AFA', // Primary brand color
      600: '#4C62D9',
      700: '#3A4BB8',
      800: '#2B3797',
      900: '#1F2876',
    },
    bg: {
      white: '#F8F9FA',
      hover: '#F3F4F6',
      card: '#FFFFFF',
      sidebar: '#F9FAFB',
    }
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'bg.white',
        color: 'gray.900',
      },
    },
  },
})

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')

const root = createRoot(container)

root.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>
)
