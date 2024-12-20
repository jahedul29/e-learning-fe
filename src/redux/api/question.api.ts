import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACKEND_URL } from '../../constant/backend-domain';

interface Question {
  _id: string;
  examId: {
    _id: string;
    title: string;
  };
  title: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionsResponse {
  message: string;
  questions: Question[];
  pagination: {
    _page: number;
    _limit: number;
    _totalRows: number;
  };
}

interface QuestionResponse {
  message: string;
  question: Question;
}

interface CreateQuestionRequest {
  examId: string;
  title: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

interface UpdateQuestionRequest {
  questionId: string;
  title: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

export const questionApi = createApi({
  reducerPath: 'questionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Question'],
  endpoints: (builder) => ({
    // Get all questions with filters and pagination
    getQuestions: builder.query<QuestionsResponse, {
      _q?: string;
      _page?: number;
      _limit?: number;
      _examId?: string;
    }>({
      query: (params) => ({
        url: '/questions',
        method: 'GET',
        params
      }),
      providesTags: ['Question']
    }),

    // Get single question by ID
    getQuestion: builder.query<QuestionResponse, string>({
      query: (questionId) => ({
        url: `/questions/${questionId}`,
        method: 'GET'
      }),
      providesTags: ['Question']
    }),

    // Create new question
    createQuestion: builder.mutation<QuestionResponse, CreateQuestionRequest>({
      query: (body) => ({
        url: '/questions',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Question']
    }),

    // Update question
    updateQuestion: builder.mutation<QuestionResponse, UpdateQuestionRequest>({
      query: ({ questionId, ...body }) => ({
        url: `/questions/${questionId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Question']
    }),

    // Delete question
    deleteQuestion: builder.mutation<{ message: string; questionId: string }, string>({
      query: (questionId) => ({
        url: `/questions/${questionId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Question']
    }),

    // Get questions by exam ID
    getQuestionsByExam: builder.query<{ message: string; questions: Question[] }, string>({
      query: (examId) => ({
        url: `/questions/${examId}/exam`,
        method: 'GET'
      }),
      providesTags: ['Question']
    })
  })
});

export const {
  useGetQuestionsQuery,
  useGetQuestionQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuestionsByExamQuery
} = questionApi;
