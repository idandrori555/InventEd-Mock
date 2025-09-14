import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, submitAnswers } from '@/lib/api';
import type { Task, StudentAnswerChoice } from 'common/types';

export default function StudentTaskSolverPage() {
  const { lessonId, taskId } = useParams<{ lessonId: string, taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<StudentAnswerChoice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      try {
        const fetchedTask = await getTask(Number(taskId));
        setTask(fetchedTask);
        // Initialize answers state
        setAnswers(fetchedTask.questions.map((_, index) => ({
          questionIndex: index,
          selectedAnswer: -1 // -1 means not answered
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleSelectAnswer = (questionIndex: number, selectedAnswer: number) => {
    const newAnswers = [...answers];
    const answerIndex = newAnswers.findIndex(a => a.questionIndex === questionIndex);
    if (answerIndex > -1) {
      newAnswers[answerIndex].selectedAnswer = selectedAnswer;
      setAnswers(newAnswers);
    }
  };

  const handleSubmit = async () => {
    if (!lessonId || answers.some(a => a.selectedAnswer === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitAnswers(Number(lessonId), answers);
      alert('Submission successful!');
      navigate('/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading task...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!task) return <div className="text-center p-4">Task not found.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
      <p className="text-gray-600 mb-8">{task.description}</p>

      <div className="space-y-8">
        {task.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white p-6 shadow rounded-lg">
            <p className="font-semibold text-lg mb-4">{qIndex + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((option, oIndex) => (
                <label key={oIndex} className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={oIndex}
                    onChange={() => handleSelectAnswer(qIndex, oIndex)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
}
