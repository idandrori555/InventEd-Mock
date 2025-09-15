import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, generateAiTask } from '@/lib/api';
import type { Question } from 'common/types';

export default function TeacherTaskCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctAnswer: 0, type: 'multiple-choice' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (index: number, type: 'multiple-choice' | 'open-ended') => {
    const newQuestions = [...questions];
    newQuestions[index].type = type;
    if (type === 'open-ended') {
        newQuestions[index].options = [];
        newQuestions[index].correctAnswer = 0;
    } else if (newQuestions[index].options.length === 0) {
        newQuestions[index].options = ['', ''];
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };
  
  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = oIndex;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctAnswer: 0, type: 'multiple-choice' }]);
  };

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        const { questions: aiQuestions } = await generateAiTask();
        setQuestions(aiQuestions);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createTask({ title, description, questions });
      navigate('/teacher/tasks');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 shadow rounded-lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold">Generate with AI</h2>
            <p className="text-sm text-gray-500 mb-4">Let AI create a set of questions for you. (This is a placeholder).</p>
            <button 
                type="button"
                onClick={handleGenerateAi}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
            >
                {isGenerating ? 'Generating...' : 'Generate AI Questions'}
            </button>
        </div>

        <div className="space-y-6 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold">Questions</h2>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700">Question {qIndex + 1}</label>
                    <select 
                        value={q.type || 'multiple-choice'} 
                        onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value as any)}
                        className="block w-full sm:w-48 text-sm border-gray-300 rounded-md"
                    >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="open-ended">Open-Ended</option>
                    </select>
                </div>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="What is 2 + 2?"
                required
              />
              {q.type === 'multiple-choice' && (
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Options (select the correct one)</label>
                    {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                        <input
                        type="radio"
                        name={`correctAnswer-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() => setCorrectAnswer(qIndex, oIndex)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={`Option ${oIndex + 1}`}
                        required
                        />
                    </div>
                    ))}
                    <button type="button" onClick={() => addOption(qIndex)} className="text-sm text-indigo-600 hover:text-indigo-900">
                        + Add Option
                    </button>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
            + Add Another Question
          </button>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
