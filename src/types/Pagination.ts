import IQuiz from "./TQuiz";

export type TPagination = {
  totalResults: number;
  pageSize: number;
  pageNumber: number;
  results: IQuiz[];
};
