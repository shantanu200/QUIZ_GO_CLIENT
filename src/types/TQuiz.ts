import IQuestion from "./IQuestion";

export default interface IQuiz {
  id: string;
  title: string;
  description: string;
  initDate: string;
  dueDate: string;
  duration: number;
  maxScore: number;
  totalQuestion: number;
  questions: string[];
  questionModels: IQuestion[];
}

