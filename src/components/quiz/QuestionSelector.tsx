import { createNumberRange } from "@/utils/Range";
import { useState } from "react";
import { Button } from "../ui/button";
import { TAttempt } from "@/types/TAttempt";
import { useTheme } from "../theme-provider";
import { cn } from "@/lib/utils";

const QuestionSelector = ({
  questions,
  onQuestionChange,
  attempt,
}: {
  questions: number;
  onQuestionChange: (opt: number) => void;
  attempt: TAttempt;
}) => {
  const { theme } = useTheme();
  const [questionMap, _] = useState<number[]>(createNumberRange(1, questions));

  return (
    <div className="grid grid-cols-5 gap-4">
      {questionMap?.map((item, idx) => (
        <Button
          key={idx}
          size={"icon"}
          onClick={() => onQuestionChange(item - 1)}
          className={cn(
            theme === "light" && attempt[idx] && attempt[idx].answer === ""
              ? "border-2"
              : ""
          )}
          variant={
            attempt[idx]
              ? attempt[idx].answer === ""
                ? "secondary"
                : "default"
              : "outline"
          }
        >
          {item}
        </Button>
      ))}
    </div>
  );
};

export default QuestionSelector;
