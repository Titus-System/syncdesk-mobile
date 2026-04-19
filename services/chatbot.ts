import { apiFetch } from '@/lib/api';

export type QuickReplyDto = {
  label: string;
  value: string;
};

export type TriageInputDefDto = {
  mode: 'free_text' | 'quick_replies';
  quick_replies?: QuickReplyDto[];
};

export type TriageResultDto = {
  type: string;
  id: string;
  ticket_id?: string | null;
  chat_id?: string | null;
};

export type TriageDataDto = {
  triage_id: string;
  step_id?: string | null;
  message?: string | null;
  input?: TriageInputDefDto | null;
  finished?: boolean | null;
  closure_message?: string | null;
  result?: TriageResultDto | null;
};

export type AttendanceStepDto = {
  step: string;
  question: string;
  answer_value?: string | null;
  answer_text?: string | null;
};

export type AttendanceResponseDto = {
  triage_id: string;
  status: string;
  start_date: string;
  end_date?: string | null;
  client: {
    id: string;
    name: string;
    email: string;
    company?: {
      id: string;
      name: string;
    } | null;
  };
  triage: AttendanceStepDto[];
  result?: {
    type: string;
    closure_message: string;
  } | null;
  evaluation?: {
    rating: number;
  } | null;
  needs_evaluation: boolean;
  current_step_id?: string | null;
  current_message?: string | null;
  current_input?: TriageInputDefDto | null;
};

export type SendTriageMessagePayload = {
  triage_id: string;
  step_id: string;
  answer_text?: string;
  answer_value?: string;
};

export async function createTriage() {
  return await apiFetch<TriageDataDto>('/chatbot/', {
    method: 'POST',
  });
}

export async function sendTriageMessage(payload: SendTriageMessagePayload) {
  return await apiFetch<TriageDataDto>('/chatbot/webhook', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAttendanceById(triageId: string) {
  return await apiFetch<AttendanceResponseDto>(`/chatbot/${triageId}`);
}
