import { UserSolutionItem } from "@/types/TSolution";

interface QuizAttemptItem {
  Key: string;
  Value: Array<{ Key: string; Value: number }>;
}
export function TransformQuizAttempt(quizAttempt: QuizAttemptItem[]) {
  let transformed: Record<string, Record<string, number>> = {};

  quizAttempt.forEach((item) => {
    let key = item.Key;
    let value: Record<string, number> = {};

    item.Value.forEach((val) => {
      value[val.Key] = val.Value;
    });

    transformed[key] = value;
  });

  return transformed;
}



export type ConvUserSolution = {
  [key: string]: {
    solutionText: string;
    mediaFile: string;
  };
};

export function TransformUserSolution(quizAttempt: UserSolutionItem[]) {
  let transformed: ConvUserSolution = {};

  for (let usol of quizAttempt) {
    let key = usol.Key;
    let solutionText = "";
    let mediaFile = "";

    for (let pair of usol.Value) {
      if (pair.Key === "solutionText") {
        solutionText = pair.Value;
      } else if (pair.Key === "mediaFile") {
        mediaFile = pair.Value;
      }
    }

    transformed[key] = { solutionText, mediaFile };
  }

  return transformed;
}
