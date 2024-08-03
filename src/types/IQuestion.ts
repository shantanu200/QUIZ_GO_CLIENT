import IOption from "./IOption";

export default interface IQuestion {
  id: string;
  text: string;
  description: string;
  topics: string[];
  mediaFiles: string[];
  options: IOption[];
  answer: number;
  solution: {
    text: string;
    mediaFile: string;
    note: string;
  };
}
