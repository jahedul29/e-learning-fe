import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
import { useState } from 'react';
import { Modal, Card, Typography } from 'antd';

const { Title, Text } = Typography;

const TakeExam = () => {
  const [showScore, setShowScore] = useState(false);
  const [examScore, setExamScore] = useState({ 
    obtained: 0, 
    total: 0, 
    percentage: 0 
  });

  const surveyJson = {
    title: "English Grammar Exam",
    pages: [
      {
        title: "Page 1",
        elements: [
          {
            type: "radiogroup",
            name: "question1",
            title: "Choose the correct option to complete the sentence: '___ apple a day keeps the doctor away.'",
            isRequired: true,
            choices: [
              "An",
              "A",
              "The",
              "None"
            ],
            correctAnswer: "An",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question2",
            title: "Identify the pronoun error: 'Each of the students handed in their homework.'",
            isRequired: true,
            choices: [
              "their",
              "Each",
              "in",
              "None"
            ],
            correctAnswer: "their",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question3",
            title: "Select the correct tense: 'By next year, she ___ working here for five years.'",
            isRequired: true,
            choices: [
              "has been",
              "will have been",
              "will be",
              "has"
            ],
            correctAnswer: "will have been",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question4",
            title: "Choose the appropriate homophone: 'She will ___ the car to the meeting.'",
            isRequired: true,
            choices: [
              "bare",
              "bear",
              "beer",
              "none"
            ],
            correctAnswer: "bear",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question5",
            title: "Which option correctly completes this sentence: 'I asked him ___ he had finished the report.'",
            isRequired: true,
            choices: [
              "that",
              "if",
              "which",
              "for"
            ],
            correctAnswer: "if",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question6",
            title: "Identify the tense error: 'He has went to the store already.'",
            isRequired: true,
            choices: [
              "went",
              "has",
              "to",
              "None"
            ],
            correctAnswer: "went",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question7",
            title: "Select the correct article: '___ Eiffel Tower is located in Paris.'",
            isRequired: true,
            choices: [
              "A",
              "The",
              "An",
              "None"
            ],
            correctAnswer: "The",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question8",
            title: "Choose the correct pronoun: 'Both of the girls were proud of ___ achievements.'",
            isRequired: true,
            choices: [
              "her",
              "his",
              "their",
              "none"
            ],
            correctAnswer: "their",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question9",
            title: "Pick the correct homonym: 'He made a ___ profit from the sale.'",
            isRequired: true,
            choices: [
              "bare",
              "bear",
              "beer",
              "none"
            ],
            correctAnswer: "bare",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question10",
            title: "Complete the sentence with the appropriate clause type: 'I don't know ___ he is coming to the party.'",
            isRequired: true,
            choices: [
              "if",
              "which",
              "who",
              "none"
            ],
            correctAnswer: "if",
            marks: 5
          }
        ]
      },
      {
        title: "Page 2",
        elements: [
          {
            type: "radiogroup",
            name: "question11",
            title: "Identify the incorrect pronoun usage: 'Neither of the brothers took their turn.'",
            isRequired: true,
            choices: [
              "Neither",
              "their",
              "took",
              "None"
            ],
            correctAnswer: "their",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question12",
            title: "Choose the correct article: '___ university in California has a beautiful campus.'",
            isRequired: true,
            choices: [
              "An",
              "The",
              "A",
              "None"
            ],
            correctAnswer: "A",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question13",
            title: "Identify the correct tense: 'They ___ dinner before he arrived.'",
            isRequired: true,
            choices: [
              "have had",
              "has had",
              "had had",
              "have"
            ],
            correctAnswer: "had had",
            marks: 5
          },
          {
            type: "radiogroup",
            name: "question14",
            title: "Choose the correct homophone: 'The baker kneaded the ___.'",
            isRequired: true,
            choices: [
              "need",
              "knead",
              "kneaded",
              "none"
            ],
            correctAnswer: "kneaded",
            marks: 5
          }
        ]
      }
    ],
    showCompletedPage: false,
    completeText: "Submit Exam",
    showProgressBar: "bottom",
    showNavigationButtons: true,
    showPrevButton: true
  };

  const calculateScore = (results: any, questions: any[]) => {
    let obtainedMarks = 0;
    let totalMarks = 0;

    questions.forEach(question => {
      totalMarks += question.marks;
      
      if (results[question.name] === question.correctAnswer) {
        obtainedMarks += question.marks;
      }
    });

    const percentage = (obtainedMarks / totalMarks) * 100;

    return {
      obtained: obtainedMarks,
      total: totalMarks,
      percentage: Math.round(percentage)
    };
  };

  const survey = new Model(surveyJson);
  
  survey.onComplete.add((sender) => {
    const results = sender.data;
    const questions = surveyJson.pages[0].elements;
    const score = calculateScore(results, questions);
    
    setExamScore(score);
    setShowScore(true);

    console.log("Exam results:", results);
    console.log("Score:", score);
  });

  const handleModalClose = () => {
    setShowScore(false);
    // You might want to redirect the user or reset the exam here
  };

  return (
    <div className="container mx-auto py-8 mt-16">
      <Card className="mb-8 shadow-md mt-32">
        <div className="text-center mb-6">
          <Title level={2} className="!mb-6">Course Examination Instructions</Title>
          <div className="bg-blue-50 p-6 rounded-lg">
            <Text className="block mb-4">
              Please read each question carefully and select the best answer.
            </Text>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow">
                <Text strong className="text-lg block mb-2">Total Questions</Text>
                <Text className="text-2xl text-blue-600">
                  {surveyJson.pages[0].elements.length}
                </Text>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <Text strong className="text-lg block mb-2">Total Marks</Text>
                <Text className="text-2xl text-blue-600">
                  {surveyJson.pages[0].elements.reduce((acc, q) => acc + q.marks, 0)}
                </Text>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <Text strong className="text-lg block mb-2">Passing Criteria</Text>
                <Text className="text-2xl text-blue-600">60%</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow-md">
        <Survey model={survey} />
      </Card>
      
      <Modal
        title="Exam Results"
        open={showScore}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-4">Your Score</h2>
          <p className="text-xl mb-2">
            Marks: {examScore.obtained} out of {examScore.total}
          </p>
          <p className="text-lg">
            Percentage: {examScore.percentage}%
          </p>
          <p className="mt-4 font-semibold">
            {examScore.percentage >= 60 ? 
              "Congratulations! You have passed the exam." : 
              "Sorry, you did not pass the exam. Please try again."}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default TakeExam; 