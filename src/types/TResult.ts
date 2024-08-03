import IQuiz from "./TQuiz";

export type TResult = {
  id: string;
  quizId: string;
  quizModel: IQuiz;
  userId: string;
  quizToken: string;
  isActive: boolean;
  isOver: boolean;
  quizAttempt: [
    {
      Key: string;
      Value: Array<{ Key: string; Value: number }>;
    }
  ];
  correctAnswers: number;
  wrongAnswers: number;
  totalAttempted: number;
  accuracy: number;
  totalScore: number;
  User: {
    name: string;
    email: string;
  };
};
