export interface AISuggestionCriteriaDto {
  preferredSkills?: string[];
  meetingMode?: 'Online' | 'In-Person' | 'Both';
  department?: string;
}

export interface DateRange {
  start: string;
  end: string;
}



