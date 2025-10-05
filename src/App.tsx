import React, { useCallback, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { Login } from './pages/Login'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { JobListings } from './pages/JobListings'
import { CreateJob } from './pages/CreateJob'
import { ChatPage } from './pages/ChatPage'
import { JobCandidates } from './pages/JobCandidates'
import CandidateDetails from './pages/CandidateDetails'
import { ApplyJob } from './pages/ApplyJob'
import { Settings } from './pages/Settings'
import { Feedback } from './pages/Feedback'
import { Sidebar } from './components/Sidebar'
import { ChatWidget } from './components/ChatWidget'
import ResumeParser from './components/ResumeParser'
import { JobFormData } from './pages/CreateJob'
import ChatOverlay from './components/ChatOverlay'
import { RobinButton } from './components/RobinButton'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isResetPasswordPage = location.pathname === '/reset-password'
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

  const [isChatOverlayOpen, setChatOverlayOpen] = useState(false);

  // Use RobinButton from components for overlay trigger

  return (
    <Box minH="100vh" bg="#FAFAFA">
      {!isLoginPage && !isResetPasswordPage && <Sidebar />}
      <Box ml={!isLoginPage && !isResetPasswordPage ? '250px' : 0}>
        <Routes>
          {/* Redirect root to login if not authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/job-listings" element={<Navigate to="/jobs" replace />} />
          <Route path="/create-job" element={<CreateJob globalFormData={formData} setGlobalFormData={setFormData} />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
          <Route path="/job-candidates/:jobId" element={<JobCandidates />} />
          <Route path="/job-candidates/:jobId/candidate/:candidateId" element={<CandidateDetails />} />
          <Route path="/candidates/:candidateId" element={<CandidateDetails />} />
          <Route path="/resume-parser" element={<ResumeParser />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Box>
      {/* Show RobinButton globally except on /login, /reset-password and /chat */}
      {!isLoginPage && !isResetPasswordPage && !isChatPage && <RobinButton onClick={() => setChatOverlayOpen(true)} />}
      {/* Global Chat Overlay (ChatPage as overlay) */}
      <React.Suspense fallback={null}>
        {!isLoginPage && !isResetPasswordPage && !isChatPage && (
          <>
            {/* Overlay is shown when open */}
            <Box as="span">
              {isChatOverlayOpen && (
                <>
                  {/* Overlay disables background scroll */}
                  <Box
                    position="fixed"
                    top={0}
                    left={0}
                    width="100vw"
                    height="100vh"
                    bg="blackAlpha.300"
                    zIndex={2999}
                    onClick={() => setChatOverlayOpen(false)}
                  />
                  {/* ChatOverlay renders ChatPage as 30% right overlay */}
                  {/* Dynamically import to avoid circular deps if needed */}
                  <ChatOverlay isOpen={isChatOverlayOpen} onClose={() => setChatOverlayOpen(false)} />
                </>
              )}
            </Box>
          </>
        )}
      </React.Suspense>
    </Box>
  )
}

export default App
