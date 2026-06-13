const API_URL = "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.error || "Request failed");
  }

  return json.data as T;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      fetchApi<{ user: any; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetchApi<{ user: any; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => fetchApi<any>("/auth/me"),
  },
  modules: {
    list: () => fetchApi<any[]>("/modules"),
    get: (slug: string) => fetchApi<any>(`/modules/${slug}`),
    lessons: (slug: string) => fetchApi<any[]>(`/modules/${slug}/lessons`),
  },
  ai: {
    chat: (message: string, session_id?: string) =>
      fetchApi<{ response: string; session_id: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, session_id }),
      }),
    history: (session_id: string) =>
      fetchApi<any[]>(`/ai/chat/${session_id}`),
    explain: (topic: string, level?: string) =>
      fetchApi<{ explanation: string }>("/ai/explain", { method: "POST", body: JSON.stringify({ topic, level }) }),
    generateQuiz: (topic: string, difficulty?: string, count?: number) =>
      fetchApi<{ questions: any[] }>("/ai/generate-quiz", { method: "POST", body: JSON.stringify({ topic, difficulty, count }) }),
    recommendations: () =>
      fetchApi<{ recommendation: string; completedModules: number }>("/ai/recommendations", { method: "POST" }),
  },
  quizzes: {
    start: (quiz_id: string) =>
      fetchApi<any>("/quizzes/start", {
        method: "POST",
        body: JSON.stringify({ quiz_id }),
      }),
    submit: (data: { attempt_id: string; answers: any[]; time_taken_seconds: number }) =>
      fetchApi<any>("/quizzes/submit", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    result: (id: string) => fetchApi<any>(`/quizzes/${id}/result`),
  },
  progress: {
    get: (userId: string) => fetchApi<any>(`/progress/${userId}`),
    update: (data: { lesson_id?: string; module_id?: string; status: string; score?: number }) =>
      fetchApi<any>("/progress/update", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
