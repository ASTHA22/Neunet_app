export interface ResumeLinks {
  linkedIn?: string;
  gitHub?: string;
  website?: string;
  other?: string;
}

export interface ResumeEducation {
  degree?: string;
  institute?: string;
  major?: string;
  minor?: string;
  start?: string;
  end?: string;
  location?: string;
}

export interface ResumeExperience {
  organization?: string;
  position?: string;
  role_description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}

export interface ResumeProject {
  title?: string;
  description?: string;
}

export interface ResumePublication {
  title?: string;
  link?: string;
  description?: string;
}

export interface ResumeData {
  name?: string;
  email?: string;
  secondary_email?: string;
  phone_number?: string;
  secondary_phone_number?: string;
  location?: string;
  links?: ResumeLinks;
  skills?: string;
  education?: ResumeEducation[];
  work_experience?: ResumeExperience[];
  projects?: ResumeProject[];
  co_curricular_activities?: string;
  publications?: ResumePublication[];
  achievements?: string;
  certifications?: string;
  references?: string;
  languages?: string;
  hobbies?: string;
  keywords?: string;
  [key: string]: any;
}
