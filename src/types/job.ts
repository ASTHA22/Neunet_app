export interface Job {
  id: string;
  job_id: string;
  title: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string;
  created_at: string;
  growth_opportunities?: string;
  tech_stack?: string;
}

export interface JobQuestionnaire {
  questions: string[];
  answers: string[];
}

export interface JobWithQuestionnaire extends Job {
  questionnaire?: JobQuestionnaire;
}
