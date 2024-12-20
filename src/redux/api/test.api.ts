import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACKEND_URL } from '../../constant/backend-domain';

interface Exam {
  _id: string;
  courseId: {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

interface ExamsResponse {
  message: string;
  exams: Exam[];
  pagination: {
    _page: number;
    _limit: number;
    _totalRows: number;
  };
}

interface ExamResponse {
  message: string;
  exam: Exam;
}

interface CreateExamRequest {
  courseId: string;
  title: string;
  description: string;
}

interface UpdateExamRequest {
  examId: string;
  title: string;
  description: string;
}

export const testApi = createApi({
  reducerPath: 'testApi',
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
  tagTypes: ['Exam'],
  endpoints: (builder) => ({
    // Get all exams with filters and pagination
    getExams: builder.query<ExamsResponse, {
      _q?: string;
      _page?: number;
      _limit?: number;
      _courseId?: string;
    }>({
      query: (params) => ({
        url: '/exams',
        method: 'GET',
        params
      }),
      providesTags: ['Exam']
    }),

    // Get single exam by ID
    getExam: builder.query<ExamResponse, string>({
      query: (examId) => ({
        url: `/exams/${examId}`,
        method: 'GET'
      }),
      providesTags: ['Exam']
    }),

    // Create new exam
    createExam: builder.mutation<ExamResponse, CreateExamRequest>({
      query: (body) => ({
        url: '/exams',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Exam']
    }),

    // Update exam
    updateExam: builder.mutation<ExamResponse, UpdateExamRequest>({
      query: ({ examId, ...body }) => ({
        url: `/exams/${examId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Exam']
    }),

    // Delete exam
    deleteExam: builder.mutation<{ message: string; examId: string }, string>({
      query: (examId) => ({
        url: `/exams/${examId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Exam']
    }),

    // Get exams by course ID
    getExamsByCourse: builder.query<{ message: string; exams: Exam[] }, string>({
      query: (courseId) => ({
        url: `/exams/course/${courseId}`,
        method: 'GET'
      }),
      providesTags: ['Exam']
    })
  })
});

export const {
  useGetExamsQuery,
  useGetExamQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetExamsByCourseQuery
} = testApi;
