import { ProgressRecord } from '../entities/progress';

export function calculateOverallPerformance(records: ProgressRecord[]): number {
  if (records.length === 0) return 0;
  const avg = records.reduce((sum, r) => {
    return sum + (r.understanding + r.problemSolving + r.codeQuality + r.participation) / 4;
  }, 0);
  return Math.round(avg / records.length);
}

export function calculateAverageMetrics(records: ProgressRecord[]) {
  if (records.length === 0) {
    return {
      understanding: 0,
      problemSolving: 0,
      codeQuality: 0,
      participation: 0,
    };
  }

  return {
    understanding: Math.round(records.reduce((sum, r) => sum + r.understanding, 0) / records.length),
    problemSolving: Math.round(records.reduce((sum, r) => sum + r.problemSolving, 0) / records.length),
    codeQuality: Math.round(records.reduce((sum, r) => sum + r.codeQuality, 0) / records.length),
    participation: Math.round(records.reduce((sum, r) => sum + r.participation, 0) / records.length),
  };
}

export function getProgressTrend(records: ProgressRecord[]) {
  return records.map((record, index) => ({
    session: `Session ${index + 1}`,
    average: Math.round(
      (record.understanding + record.problemSolving + record.codeQuality + record.participation) / 4,
    ),
    problemSolving: record.problemSolving,
    understanding: record.understanding,
    codeQuality: record.codeQuality,
  }));
}


