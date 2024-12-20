import { Button, Drawer, Form, Input, Select, Space, notification } from 'antd';
import { useEffect, useState } from 'react';
import { useGetCoursesQuery } from '../../../Courses/course.service';
import { useCreateExamMutation, useUpdateExamMutation } from '../../../../../redux/api/test.api';
import QuestionsList from './components/QuestionsList';
import { isEqual } from 'lodash';

interface TestData {
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

interface CreateTestProps {
  open: boolean;
  onClose: () => void;
  editData?: TestData;
}

const CreateTest = ({ open, onClose, editData }: CreateTestProps) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [examId, setExamId] = useState<string>('');
  const [initialValues, setInitialValues] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { data: coursesData } = useGetCoursesQuery({ 
    _page: 1, 
    _limit: 100 
  });
  
  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();

  useEffect(() => {
    if (editData) {
      const values = {
        title: editData.title,
        description: editData.description,
        courseId: editData.courseId._id
      };
      form.setFieldsValue(values);
      setInitialValues(values);
      setExamId(editData._id);
      setCurrentStep(1);
    } else {
      form.resetFields();
      setInitialValues(null);
      setExamId('');
      setCurrentStep(1);
    }
    setHasChanges(false);
  }, [editData, form, open]);

  const handleFormChange = () => {
    if (editData) {
      const currentValues = form.getFieldsValue();
      setHasChanges(!isEqual(currentValues, initialValues));
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCurrentStep(1);
    setExamId('');
    setHasChanges(false);
    onClose();
  };

  const onFinish = async (values: any) => {
    try {
      if (editData) {
        if (!hasChanges) {
          setCurrentStep(2);
          return;
        }
        await updateExam({
          examId: editData._id,
          ...values
        }).unwrap();
        notification.success({
          message: 'Test updated successfully'
        });
        setInitialValues(values);
        setHasChanges(false);
        setCurrentStep(2);
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

  const renderFooter = () => (
    <Space>
      <Button onClick={handleClose}>Cancel</Button>
      {currentStep === 1 && (
        <Space>
          {/* {editData && (
            <Button onClick={() => setCurrentStep(2)}>
              Go to Questions
            </Button>
          )} */}
          <Button 
            type="primary" 
            onClick={() => {
              if (editData && !hasChanges) {
                setCurrentStep(2);
              } else {
                form.submit();
              }
            }}
            // disabled={editData && !hasChanges}
          >
            {editData 
              ? hasChanges 
                ? 'Update & Next' 
                : 'Go to Questions'
              : 'Next'
            }
          </Button>
        </Space>
      )}
      {currentStep === 2 && (
        <Space>
          <Button onClick={() => setCurrentStep(1)}>
            Back to Test Details
          </Button>
          <Button type="primary" onClick={handleClose}>
            Finish
          </Button>
        </Space>
      )}
    </Space>
  );

  return (
    <Drawer
      title={editData ? "Edit Test" : "Create New Test"}
      width={720}
      open={open}
      onClose={handleClose}
      extra={renderFooter()}
    >
      {currentStep === 1 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleFormChange}
          initialValues={editData ? {
            title: editData.title,
            description: editData.description,
            courseId: editData.courseId._id
          } : undefined}
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