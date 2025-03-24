import axios from 'axios';
import { Job } from '../types/job';

// Always use localhost for now until Azure deployment is working
const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Candidate {
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

export const updateCandidateStatus = async (jobId: string, candidateEmail: string, status: string) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/candidates/${candidateEmail}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating candidate status:', error);
    throw error;
  }
};

export const getCandidateResume = async (email: string) => {
  try {
    const response = await apiClient.get(`/candidates/${email}/resume`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

export const applyForJob = async (jobId: string, application: JobApplication) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/apply`, application);
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};
