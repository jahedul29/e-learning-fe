import { Table, Tag } from 'antd';
import { useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Typography } from 'antd';

const { Title } = Typography;

interface ResultData {
  key: string;
  studentName: string;
  testName: string;
  score: number;
  timeTaken: number;
  submittedAt: string;
  status: 'passed' | 'failed';
}

const ResultsPage = () => {
  const [loading, setLoading] = useState(false);

  const columns: ColumnsType<ResultData> = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => `${score}%`,
    },
    {
      title: 'Time Taken (minutes)',
      dataIndex: 'timeTaken',
      key: 'timeTaken',
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'passed' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const dummyData: ResultData[] = [
    {
      key: '1',
      studentName: 'John Doe',
      testName: 'Final Test JavaScript',
      score: 85,
      timeTaken: 55,
      submittedAt: '2024-03-15 14:30',
      status: 'passed',
    },
    {
      key: '2',
      studentName: 'Jane Smith',
      testName: 'Mid-term React',
      score: 65,
      timeTaken: 40,
      submittedAt: '2024-03-14 10:15',
      status: 'failed',
    },
  ];

  return (
    <div className="p-6">
      <Title level={2} className="!mb-8">
        Test Results
      </Title>
      <Table 
        columns={columns} 
        dataSource={dummyData} 
        loading={loading}
      />
    </div>
  );
};

export default ResultsPage; 