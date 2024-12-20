import { AppstoreOutlined, EditOutlined, EllipsisOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Select, Space, Table, Popover, notification, Modal } from 'antd';
import { Fragment, useState, useEffect } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import { Link } from 'react-router-dom';
import { Header } from 'antd/es/layout/layout';
import { useGetExamsQuery, useDeleteExamMutation } from '../../../redux/api/test.api';
import { useGetCoursesQuery } from '../Courses/course.service';
import CreateTest from './components/CreateTest';

const { Title } = Typography;

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

const TestsPage = () => {
  const [deleteExam] = useDeleteExamMutation();

  const [params, setParams] = useState({
    _q: '',
    _page: 1,
    _limit: 10,
    _courseId: 'all'
  });

  // Fetch tests with params
  const { data: testsData, isLoading } = useGetExamsQuery(params);
  
  // Fetch courses for filter dropdown
  const { data: coursesData } = useGetCoursesQuery({ 
    _page: 1, 
    _limit: 100  // Fetch all courses for dropdown
  });

  const courseOptions = coursesData?.courses.map(course => ({
    value: course._id,
    label: course.name
  })) || [];

  // Add "All Courses" option
  courseOptions.unshift({
    value: 'all',
    label: 'All Courses'
  });

  const columns: ColumnsType<TestData> = [
    {
      title: 'Test Name',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Course',
      dataIndex: ['courseId', 'name'],
      key: 'courseName',
      sorter: (a, b) => a.courseId.name.localeCompare(b.courseId.name),
    },
    {
      title: 'Total Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      sorter: (a, b) => a.totalQuestions - b.totalQuestions,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Fragment>
          <Space>
            <Button className='border border-gray-300 flex items-center justify-center' onClick={() => handleEdit(record)}>
              <EditOutlined />
            </Button>
              <Button danger className='border border-gray-300 flex items-center justify-center' onClick={() => handleDelete(record._id)}>
                <DeleteOutlined />
            </Button>
          </Space>
        </Fragment>
      ),
    },
  ];

  const onSearchHandler = (value: string) => {
    setParams({
      ...params,
      _q: value,
      _page: 1 // Reset to first page on new search
    });
  };

  const courseFilterHandler = (value: string) => {
    setParams({
      ...params,
      _courseId: value,
      _page: 1 // Reset to first page on filter change
    });
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);

  const handleNewTest = () => {
    setEditingTest(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: TestData) => {
    setEditingTest(record);
    setIsDrawerOpen(true);
  };

  const handleDelete = (testId: string) => {
    Modal.confirm({
      title: 'Delete Test',
      content: 'Are you sure you want to delete this test?',
      okText: 'Yes',
      cancelText: 'No',
      okButtonProps: { style: { backgroundColor: 'red', color: 'white' } },
      onOk: async () => {
        try {
          await deleteExam(testId).unwrap();
          notification.success({
            message: 'Delete test successfully!'
          });
        } catch (error: any) {
          notification.error({
            message: 'Failed to delete test',
            description: error.message
          });
        }
      }
    });
  };

  return (
    <Fragment>
      <Header className='sub-header pl-6'>
        <Space className='sub-header__wrap'>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleNewTest}>
            New Test
          </Button>
          <Search 
            placeholder='Search tests' 
            onSearch={onSearchHandler}
            style={{ width: 200 }} 
          />

          <Select
            size='middle'
            placeholder='Please select your course'
            value={params._courseId}
            onChange={courseFilterHandler}
            style={{ width: '240px' }}
            options={courseOptions}
          />
        </Space>
      </Header>
      <div className='course-content mt-6'>
        <div className='course-content__wrap'>
          <div className='course-content__list'>
            <Table 
              columns={columns} 
              dataSource={testsData?.exams} 
              loading={isLoading}
              rowKey="_id"
              pagination={{
                current: params._page,
                pageSize: params._limit,
                total: testsData?.pagination._totalRows,
                onChange: (page) => setParams({ ...params, _page: page })
              }}
            />
          </div>
        </div>
      </div>

      <CreateTest 
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        editData={editingTest}
      />
    </Fragment>
  );
};

export default TestsPage; 