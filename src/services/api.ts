import axios from 'axios';
import { Job } from '../types/job';

// Use the deployed API for production, localhost for development
const isProduction = window.location.hostname === 'www.neunet.io';
const API_URL = isProduction
  ? 'https://neunet-ai-services.onrender.com' // Production API URL
  : 'http://localhost:8000';                 // Local FastAPI backend

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Candidate {
  candidate_id?: string;
  email: string;
  name: string;
  ranking: number;
  resume: any;
  conversation: string;
}

export interface Application {
  job_id: string;
  candidate_email: string;
  status: string;
  ranking: number;
}

export interface JobApplication {
  name: string;
  email: string;
  resume: string;
  cover_letter?: string;
}

// Jobs API
export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const response = await apiClient.get('/jobs/');
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const createJob = async (jobData: Partial<Job>): Promise<{ job_id: string }> => {
  try {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const fetchJobById = async (jobId: string): Promise<Job> => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

// Candidates API
export const getJobCandidates = async (jobId: string) => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}/candidates`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

export const updateCandidateStatus = async (jobId: string, candidateId: string, status: string) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/candidates/${candidateId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating candidate status:', error);
    throw error;
  }
};

export const getCandidateById = async (candidateId: string) => {
  try {
    const response = await apiClient.get(`/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidate:', error);
    throw error;
  }
};

export const getCandidateResume = async (jobId: string, email: string, config = {}) => {
  try {
    return await apiClient.get(`/candidates/${jobId}/${email}/resume`, config);
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

export const applyForJob = async (jobId: string, application: any) => {
  try {
    const formData = new FormData();
    formData.append('name', application.name);
    formData.append('email', application.email);
    formData.append('cover_letter', application.cover_letter || '');
    formData.append('ranking', application.ranking || 0.0);
    formData.append('resume', application.resume); // application.resume should be a File object

    const response = await apiClient.post(
      `/jobs/${jobId}/apply`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export const sendEmail = async ({ to, subject, body }: { to: string[]; subject: string; body: string }) => {
  try {
    const response = await apiClient.post('/api/send-email', { to, subject, body });
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const generateJobDescription = async (jobData: Partial<Job>) => {
  try {
    const response = await apiClient.post('/api/generate-job-description', jobData);
    return response.data;
  } catch (error) {
    console.error('Error generating job description:', error);
    throw error;
  }
};
