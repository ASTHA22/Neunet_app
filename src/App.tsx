import React, { useCallback, useState } from 'react'
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
import { JobFormData } from './pages/CreateJob'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isChatPage = location.pathname === '/chat'

  // Global job form state for /create-job
  const [formData, setFormData] = useState<JobFormData | null>(null)

  // Callback for AI job generation (only used on /create-job)
  const handleAIGeneratedJob = useCallback((jobFields: Partial<JobFormData>) => {
    setFormData(prev => ({
      ...(prev || {}),
      ...jobFields,
      title: jobFields.title || (prev ? prev.title : ''),
      company_name: jobFields.company_name || (prev ? prev.company_name : ''),
      location: jobFields.location || (prev ? prev.location : ''),
      job_type: jobFields.job_type || (prev ? prev.job_type : ''),
      description: jobFields.description || (prev ? prev.description : ''),
      requirements: jobFields.requirements || (prev ? prev.requirements : ''),
      responsibilities: jobFields.responsibilities || (prev ? prev.responsibilities : ''),
      salary_range: jobFields.salary_range || (prev ? prev.salary_range : ''),
      tech_stack: jobFields.tech_stack || (prev ? prev.tech_stack : ''),
      growth_opportunities: jobFields.growth_opportunities || (prev ? prev.growth_opportunities : ''),
      benefits: jobFields.benefits || (prev ? prev.benefits : ''),
      about_company: jobFields.about_company || (prev ? prev.about_company : ''),
      job_level: jobFields.job_level || (prev ? prev.job_level : ''),
      time_commitment: jobFields.time_commitment || (prev ? prev.time_commitment : ''),
    }))
  }, [])

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
          <Route path="/create-job" element={<CreateJob globalFormData={formData} setGlobalFormData={setFormData} />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
          <Route path="/job-candidates/:jobId" element={<JobCandidates />} />
          <Route path="/job-candidates/:jobId/candidate/:candidateId" element={<CandidateDetails />} />
        </Routes>
      </Box>
      {!isLoginPage && !isChatPage && (
        location.pathname === '/create-job'
          ? <ChatWidget onAIGeneratedJob={handleAIGeneratedJob} />
          : <ChatWidget />
      )}
    </Box>
  )
}

export default App
