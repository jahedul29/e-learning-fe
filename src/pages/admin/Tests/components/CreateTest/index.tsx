import { Button, Drawer, Form, Input, Select, Space, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useGetCoursesQuery } from '../../../Courses/course.service';
import { useCreateExamMutation, useUpdateExamMutation } from '../../../../../redux/api/test.api';
import QuestionsList from './components/QuestionsList';

interface CreateTestProps {
  open: boolean;
  onClose: () => void;
  editData?: any; // Add proper type
}

const CreateTest = ({ open, onClose, editData }: CreateTestProps) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [examId, setExamId] = useState<string>('');
  
  const { data: coursesData } = useGetCoursesQuery({ 
    _page: 1, 
    _limit: 100 
  });
  
  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        title: editData.title,
        description: editData.description,
        courseId: editData.courseId._id
      });
      setExamId(editData._id);
      setCurrentStep(2);
    }
  }, [editData, form]);

  const handleClose = () => {
    form.resetFields();
    setCurrentStep(1);
    setExamId('');
    onClose();
  };

  const onFinish = async (values: any) => {
    try {
      if (editData) {
        await updateExam({
          examId: editData._id,
          ...values
        }).unwrap();
        notification.success({
          message: 'Test updated successfully'
        });
      } else {
        const result = await createExam(values).unwrap();
        setExamId(result.exam._id);
        notification.success({
          message: 'Test created successfully'
        });
        setCurrentStep(2);
      }
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message
      });
    }
  };

  return (
    <Drawer
      title={editData ? "Edit Test" : "Create New Test"}
      width={720}
      open={open}
      onClose={handleClose}
      extra={
        <Space>
          <Button onClick={handleClose}>Cancel</Button>
          {currentStep === 1 && (
            <Button type="primary" onClick={() => form.submit()}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={handleClose}>
              Finish
            </Button>
          )}
        </Space>
      }
    >
      {currentStep === 1 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select
              placeholder="Select a course"
              options={coursesData?.courses.map(course => ({
                value: course._id,
                label: course.name
              }))}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Test Title"
            rules={[{ required: true, message: 'Please enter test title' }]}
          >
            <Input placeholder="Enter test title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter test description" />
          </Form.Item>
        </Form>
      )}

      {currentStep === 2 && examId && (
        <QuestionsList examId={examId} />
      )}
    </Drawer>
  );
};

export default CreateTest; 