import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { JobListings } from './pages/JobListings'
import { CreateJob } from './pages/CreateJob'
import { ChatPage } from './pages/ChatPage'
import { JobCandidates } from './pages/JobCandidates'
import { CandidateDetails } from './pages/CandidateDetails'
import { ApplyJob } from './pages/ApplyJob'
import { Sidebar } from './components/Sidebar'
import { ChatWidget } from './components/ChatWidget'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isChatPage = location.pathname === '/chat'

  return (
    <Box minH="100vh" bg="#FAFAFA">
      {!isLoginPage && <Sidebar />}
      <Box ml={!isLoginPage ? '250px' : 0}>
        <Routes>
          {/* Redirect root to login if not authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/job-listings" element={<Navigate to="/jobs" replace />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
          <Route path="/job-candidates/:jobId" element={<JobCandidates />} />
          <Route path="/job-candidates/:jobId/candidate/:candidateId" element={<CandidateDetails />} />
        </Routes>
      </Box>
      {!isLoginPage && !isChatPage && <ChatWidget />}
    </Box>
  )
}

export default App
