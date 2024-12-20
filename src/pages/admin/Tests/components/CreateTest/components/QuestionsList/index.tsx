import { Button, Form, Input, Modal, Select, Space, Table, Tag, notification } from 'antd';
import { useState, useEffect } from 'react';
import { useGetQuestionsByExamQuery, useCreateQuestionMutation, useUpdateQuestionMutation, useDeleteQuestionMutation } from '../../../../../../../redux/api/question.api';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Question {
  _id: string;
  title: string;
  questionType: 'radio' | 'checkbox';
  options: string[];
  correctAnswer: string;
  marks: number;
}

interface FormValues {
  title: string;
  questionType: 'radio' | 'checkbox';
  options: string[];
  correctAnswer: string;
  marks: number;
}

interface QuestionsListProps {
  examId: string;
}

interface ApiError {
  message: string;
}

const QuestionsList = ({ examId }: QuestionsListProps) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);

  const { data: questionsData, isLoading } = useGetQuestionsByExamQuery(examId);
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  // Watch for changes in options
  useEffect(() => {
    const formOptions = form.getFieldValue('options');
    if (Array.isArray(formOptions)) {
      setOptions(formOptions);
    } else {
      setOptions(['', '', '', '']);
    }
  }, [form]);

  const columns = [
    {
      title: 'Question',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'questionType',
      key: 'questionType',
      render: (type: string) => (
        <Tag color={type === 'multiple-choice' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Question) => (
        <Space>
          <Button 
            className='border border-gray-300 flex items-center justify-center' 
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Button>
          <Button 
            className='border border-gray-300 flex items-center justify-center' 
            danger 
            onClick={() => handleDelete(record._id)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    const questionOptions = Array.isArray(question.options) ? question.options : ['', '', '', ''];
    setOptions(questionOptions);
    form.setFieldsValue({
      title: question.title,
      questionType: 'radio',
      options: questionOptions,
      correctAnswer: question.correctAnswer,
      marks: question.marks
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    Modal.confirm({
      title: 'Delete Question',
      content: 'Are you sure you want to delete this question?',
      okText: 'Yes',
      cancelText: 'No',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteQuestion(questionId).unwrap();
          notification.success({
            message: 'Question deleted successfully'
          });
        } catch (error: any) {
          notification.error({
            message: 'Error',
            description: error.message
          });
        }
      }
    });
  };

  const handleModalOk = () => {
    form.submit();
  };

  const handleModalCancel = () => {
    form.resetFields();
    setEditingQuestion(null);
    setOptions(['', '', '', '']);
    setIsModalOpen(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    const currentFormValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentFormValues,
      options: newOptions,
      ...(currentFormValues.correctAnswer === options[index] && {
        correctAnswer: undefined
      })
    });
  };

  const onFinish = async (values: FormValues) => {
    const formattedValues = {
      ...values,
      options: Array.isArray(values.options) ? values.options : options
    };

    if (formattedValues.options.some((option: string) => !option.trim())) {
      notification.error({
        message: 'Error',
        description: 'All options must be filled'
      });
      return;
    }

    try {
      if (editingQuestion) {
        await updateQuestion({
          questionId: editingQuestion._id,
          ...formattedValues,
          questionType: 'radio'
        }).unwrap();
      } else {
        await createQuestion({
          examId,
          ...formattedValues,
          questionType: 'radio'
        }).unwrap();
      }
      
      notification.success({
        message: `Question ${editingQuestion ? 'updated' : 'created'} successfully`
      });
      handleModalCancel();
    } catch (error) {
      const err = error as ApiError;
      notification.error({
        message: 'Error',
        description: err.message || 'An error occurred'
      });
    }
  };

  const handleAddNew = () => {
    const initialOptions = ['', '', '', ''];
    form.resetFields();
    form.setFieldsValue({
      questionType: 'radio',
      options: initialOptions
    });
    setOptions(initialOptions);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-4">
        <Button type="primary" onClick={handleAddNew}>
          Add Question
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={questionsData?.questions || []} 
        loading={isLoading}
        rowKey="_id"
      />

      <Modal
        title={editingQuestion ? "Edit Question" : "Add Question"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values: FormValues) => onFinish(values)}
          initialValues={{
            questionType: 'radio',
            options: ['', '', '', '']
          }}
        >
          <Form.Item
            name="title"
            label="Question"
            rules={[{ required: true, message: 'Please enter question' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter question" />
          </Form.Item>

          <Form.Item
            name="questionType"
            label="Question Type"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="options"
            label="Options"
            required
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return options;
            }}
            initialValue={['', '', '', '']}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  status={option.trim() ? '' : 'error'}
                />
              ))}
            </Space>
          </Form.Item>

          <Form.Item
            name="correctAnswer"
            label="Correct Answer"
            rules={[{ required: true, message: 'Please select correct answer' }]}
          >
            <Select placeholder="Select correct answer">
              {options.map((option, index) => 
                option.trim() && (
                  <Select.Option key={index} value={option}>
                    {option}
                  </Select.Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="marks"
            label="Marks"
            rules={[{ required: true, message: 'Please enter marks' }]}
          >
            <Input type="number" placeholder="Enter marks" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionsList; 