// Department-specific subjects/skills mapping
export const departmentSubjects: Record<string, string[]> = {
  'School of Computer Science and Engineering': [
    'Data Structures',
    'Algorithms',
    'Object-Oriented Programming',
    'Web Development',
    'Database Design',
    'Software Engineering',
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Networks',
    'Operating Systems',
    'Compiler Design',
    'Mobile Development',
    'Cloud Computing',
    'Cybersecurity',
    'Advanced Algorithms',
    'Dynamic Programming',
    'Binary Trees',
    'Sorting',
    'Java',
    'Python',
    'C++',
    'JavaScript',
    'React',
    'Node.js',
    'SQL',
  ],
  'School of Electrical Engineering': [
    'Circuit Analysis',
    'Digital Logic',
    'Power Systems',
    'Electromagnetic Theory',
    'Signal Processing',
    'Control Systems',
    'Microprocessors',
    'Computer Architecture',
    'Power Electronics',
    'Electric Machines',
    'Telecommunications',
    'Electronic Circuits',
    'Embedded Systems',
    'VLSI Design',
    'Antenna Theory',
    'RF Engineering',
  ],
  'School of Applied Mathematics': [
    'Calculus',
    'Linear Algebra',
    'Differential Equations',
    'Probability and Statistics',
    'Complex Analysis',
    'Numerical Methods',
    'Mathematical Modeling',
    'Optimization',
    'Graph Theory',
    'Discrete Mathematics',
    'Functional Analysis',
    'Partial Differential Equations',
    'Abstract Algebra',
    'Real Analysis',
  ],
  'School of Physics': [
    'Physics I',
    'Physics II',
    'Mechanics',
    'Thermodynamics',
    'Electromagnetism',
    'Waves and Optics',
    'Modern Physics',
    'Quantum Mechanics',
    'Relativity',
    'Particle Physics',
    'Astrophysics',
    'Nuclear Physics',
    'Solid State Physics',
    'Atomic Physics',
  ],
  'School of Chemistry': [
    'General Chemistry',
    'Organic Chemistry',
    'Physical Chemistry',
    'Inorganic Chemistry',
    'Analytical Chemistry',
    'Biochemistry',
    'Organic Synthesis',
    'Chemical Kinetics',
    'Thermodynamics',
    'Electrochemistry',
    'Laboratory Techniques',
    'Spectroscopy',
  ],
  'School of Civil Engineering': [
    'Structural Analysis',
    'Reinforced Concrete Design',
    'Steel Structures',
    'Foundation Design',
    'Geotechnical Engineering',
    'Water Resources',
    'Transportation Engineering',
    'Construction Management',
    'Building Design',
    'CAD',
    'BIM',
    'Soil Mechanics',
    'Hydraulics',
  ],
};

// Get all unique subjects across all departments
export function getAllSubjects(): string[] {
  const subjectsSet = new Set<string>();
  Object.values(departmentSubjects).forEach(subjects => {
    subjects.forEach(subject => subjectsSet.add(subject));
  });
  return Array.from(subjectsSet).sort();
}

// Get subjects for a specific department
export function getSubjectsForDepartment(department: string): string[] {
  return departmentSubjects[department] || [];
}

// Get departments that have a specific subject
export function getDepartmentsForSubject(subject: string): string[] {
  return Object.entries(departmentSubjects)
    .filter(([, subjects]) => subjects.includes(subject))
    .map(([dept]) => dept);
}

// All available departments
export const allDepartments = Object.keys(departmentSubjects);
