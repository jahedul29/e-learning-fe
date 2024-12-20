import { Button, Form, Input, Modal, Select, Space, Table, Tag, notification } from 'antd';
import { useState, useEffect } from 'react';
import { useGetQuestionsByExamQuery, useCreateQuestionMutation, useUpdateQuestionMutation, useDeleteQuestionMutation } from '../../../../../../../redux/api/question.api';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface QuestionsListProps {
  examId: string;
}

const QuestionsList = ({ examId }: QuestionsListProps) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);

  const { data: questionsData, isLoading } = useGetQuestionsByExamQuery(examId);
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  // Watch for changes in options
  useEffect(() => {
    const subscription = form.getFieldValue('options');
    setOptions(subscription || ['', '', '', '']);
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
      render: (_: any, record: any) => (
        <Space>
          <Button className='border border-gray-300 flex items-center justify-center' onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Button className='border border-gray-300 flex items-center justify-center' danger onClick={() => handleDelete(record._id)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setOptions(question.options);
    form.setFieldsValue({
      title: question.title,
      questionType: 'single-choice',
      options: question.options,
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
    form.setFieldsValue({ options: newOptions });
  };

  const onFinish = async (values: any) => {
    console.log({values})
    // Validate that all options are filled
    if (values.options.some((option: string) => !option.trim())) {
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
          ...values,
          questionType: 'single-choice'
        }).unwrap();
      } else {
        await createQuestion({
          examId,
          ...values,
          questionType: 'single-choice'
        }).unwrap();
      }
      
      notification.success({
        message: `Question ${editingQuestion ? 'updated' : 'created'} successfully`
      });
      handleModalCancel();
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message
      });
    }
  };

  const handleAddNew = () => {
    form.resetFields();
    form.setFieldsValue({
      questionType: 'single-choice',
      options: ['', '', '', '']
    });
    setOptions(['', '', '', '']);
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
        dataSource={questionsData?.questions} 
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
          onFinish={onFinish}
          initialValues={{
            questionType: 'single-choice',
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
            label="Options"
            required
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