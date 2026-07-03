export type LeadSubmissionData = {
  name?: string;
  email?: string;
  message?: string;
};

export type LeadSubmissionSummary = {
  id: string;
  blockId: string;
  data: LeadSubmissionData;
  createdAt: string;
};
