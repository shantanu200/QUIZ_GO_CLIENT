import Timer from "@/common/Timer";
import QuizHeading from "@/components/quiz/Heading";
import Option from "@/components/quiz/Option";
import Question from "@/components/quiz/Question";
import QuestionSelector from "@/components/quiz/QuestionSelector";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import localStore from "@/localStore/Store";
import APIHandler from "@/server/API";
import { TAttempt } from "@/types/TAttempt";
import IQuiz from "@/types/TQuiz";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";

const QuizPage = () => {
  const navigate = useNavigate();
  const [currIdx, setCurrIdx] = useState<number>(0);
  const [attempt, setAttempt] = useState<TAttempt>({});
  const { state } = useLocation();
  const { toast } = useToast();
  const [cookie] = useCookies(["accessToken"]);
  const { theme } = useTheme();
  const {
    qIdx,
    quizAttemptMap,
    quizTime,
    setQuizAttemptMap,
    setQuizTime,
    decrementQuizTime,
    setqIdx,
    boardId,
  } = localStore((state) => state);
  const [seconds, setSeconds] = useState<number>(10 * 60);
  const [modal, setModal] = useState<boolean>(false);
  const [timeOverSec, setTimeOverSec] = useState<number>(5);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isOver, setIsOver] = useState<boolean>(false);

  useEffect(() => {
    if (seconds > 0) {
      if (seconds % 100 === 0) {
        console.log("Make an API Call");
      }
      const timerId = setTimeout(() => {
        setSeconds(seconds - 1);
        decrementQuizTime();
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setModal(true);
      setIsOver(true);
      console.error("TIME OVER");
    }
  }, [seconds]);

  useEffect(() => {
    if (isOver && timeOverSec > 0) {
      const timerId = setTimeout(() => {
        setTimeOverSec(timeOverSec - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (timeOverSec === 0 && isOver) {
      navigate("/result");
    }
  }, [isOver, timeOverSec]);

  const {
    data: quiz,
    isLoading,
    isSuccess,
  } = useQuery<IQuiz>({
    queryKey: [`quiz/${state?.quizId}`],
    queryFn: async () => {
      const { data, error } = await APIHandler(
        "GET",
        `/quiz/${state?.quizId}`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        }
      );

      if (error) {
        toast({
          title: "Server Error",
          description: "Unable to fetch quiz details",
          variant: "destructive",
        });
        return;
      }

      return data;
    },
  });

  const { mutateAsync: submitQuizHandler } = useMutation({
    mutationFn: async () => {
      const { data, error, message } = await APIHandler(
        "PATCH",
        `/board/details/${boardId}`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        },
        {
          isOver: true,
          isActive: false,
          quizAttempt: attempt,
        }
      );

      if (error) {
        console.log(message);
        toast({
          title: "Submit Error",
          description: "Unable to submit quiz! Please wait",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Quiz Submitted",
        description: "Your quiz submitted successfully",
      });

      navigate("/result");
      return data;
    },
  });

  useEffect(() => {
    if (quizTime < 0 && isSuccess) {
      setSeconds(10 * 60);
      setQuizTime(10 * 60);
    } else {
      setCurrIdx(qIdx);
      setSeconds(quizTime);
      setAttempt(quizAttemptMap);
    }
  }, [seconds]);

  if (isLoading) {
    return <Loader2Icon className=" animate-spin h-8 w-8" />;
  }

  if (!quiz) return;

  const handleNext = () => {
    let tempAttempt = attempt || {};
    if (tempAttempt[currIdx] === undefined) {
      tempAttempt[currIdx] = { answer: "", score: 0 };
    }
    setAttempt(tempAttempt);
    setQuizAttemptMap(tempAttempt);
    setCurrIdx((prev) => Math.min(prev + 1, quiz?.questionModels?.length - 1));
    setqIdx(999);
  };

  const handlePrev = () => {
    setCurrIdx((prev) => Math.max(prev - 1, 0));
    setqIdx(-999);
  };

  const onQuestionChange = (value: number) => {
    let tempAttempt = attempt || {};
    if (tempAttempt[currIdx] === undefined) {
      tempAttempt[currIdx] = { answer: "", score: 0 };
    }
    setAttempt(tempAttempt);
    setQuizAttemptMap(tempAttempt);
    setCurrIdx(value);
    setqIdx(value);
  };

  const onSelectAnswer = (value: string) => {
    let tempAttempt = attempt || {};
    if (tempAttempt[currIdx] === undefined) {
      let score =
        value === String(quiz?.questionModels[currIdx]?.answer) ? 4 : -1;
      tempAttempt[currIdx] = { answer: value, score };
    } else {
      tempAttempt[currIdx].answer = value;
    }

    setAttempt(tempAttempt);
    setQuizAttemptMap(tempAttempt);
  };

  const handleAttemptQuestion = () => {
    let totalAttempt = 0;
    for (const [_, data] of Object.entries(attempt)) {
      if (data?.answer !== "") {
        totalAttempt += 1;
      }
    }

    return totalAttempt;
  };

  return (
    <main
      className={cn(
        "w-full min-h-screen h-full flex flex-col",
        theme === "dark" ? "" : "bg-gray-100/95"
      )}
    >
      <QuizHeading title={quiz?.title} />
      <section className="w-full flex flex-grow">
        <div className="w-3/4 flex flex-col h-[90vh]">
          <div className="h-[80vh]">
            <div className="px-8  border-b-2 flex items-center justify-between py-4">
              <div className="flex items-center space-x-2">
                <h2>Question : </h2>
                <span className="text-lg">{currIdx + 1}</span>
              </div>
              <div className="flex items-center">
                <h2>Time Left:</h2>
                <Timer time={seconds} />
              </div>
            </div>
            <ScrollArea className="px-8 py-16 h-[70vh]">
              <Question question={quiz?.questionModels[currIdx]?.text} />
              <Option
                currIdx={currIdx}
                options={quiz?.questionModels[currIdx]?.options}
                onSelectAnswer={onSelectAnswer}
                defaultAnswer={
                  !attempt || attempt[currIdx] === undefined
                    ? undefined
                    : String(attempt[currIdx].answer)
                }
              />
            </ScrollArea>
          </div>
          <div className="flex items-center justify-end px-8 py-4 space-x-4 border-t-2 h-[10vh]">
            <Button
              className="w-[10%]"
              disabled={currIdx === 0}
              variant={theme === "dark" ? "secondary" : "outline"}
              size={"lg"}
              onClick={handlePrev}
            >
              Previous
            </Button>
            <Button
              className="w-[10%]"
              size={"lg"}
              variant={theme === "dark" ? "secondary" : "outline"}
              disabled={currIdx === quiz?.questionModels?.length - 1}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </div>
        <ScrollArea className="w-1/4 border-l-2 flex flex-col h-[90vh]">
          <div className="py-6 border-b-2">
            <h2 className="text-lg text-right px-8 font-semibold">
              Question Map
            </h2>
          </div>
          <div className="p-8 flex-grow">
            <QuestionSelector
              onQuestionChange={onQuestionChange}
              questions={20}
              attempt={attempt!}
            />
          </div>
          <div className="py-4 px-8 flex flex-1 justify-end">
            <Button
              size={"lg"}
              variant={"destructive"}
              onClick={() => {
                setModal(true);
                setIsSubmit(true);
              }}
            >
              Submit
            </Button>
          </div>
        </ScrollArea>
      </section>
      <Dialog
        open={modal}
        onOpenChange={() => {
          if (isSubmit) {
            setModal(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isOver ? "Quiz Over" : "Submit Quiz"}</DialogTitle>
            <DialogDescription>Exausted complete time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mb-4">
            <div className="space-x-4">
              <span>Total Questions:</span>
              <span className="text-purple-600 font-bold text-lg">
                {quiz?.questionModels?.length}
              </span>
            </div>
            <div className="space-x-4">
              <span>Total Attempted Question: </span>
              <span className="text-primary font-bold text-lg">
                {handleAttemptQuestion()}
              </span>
            </div>
          </div>
          <DialogFooter>
            {!isOver ? (
              <Button className="w-full" onClick={() => submitQuizHandler()}>
                Submit Quiz
              </Button>
            ) : (
              <Button disabled className="w-full bg-primary">
                Submitting quiz in {timeOverSec}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default QuizPage;
