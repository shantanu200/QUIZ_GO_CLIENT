import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import APIHandler from "@/server/API";
import { TResult } from "@/types/TResult";
import {
  ConvUserSolution,
  TransformQuizAttempt,
  TransformUserSolution,
} from "@/utils/Convert";
import { createNumberRange } from "@/utils/Range";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChartBigIcon,
  CircleCheckBigIcon,
  CircleOffIcon,
  ClipboardCheckIcon,
  LocateFixedIcon,
  MoveLeft,
  MoveRight,
  RefreshCcwIcon,
  SkipForwardIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TUserSolution } from "@/types/TSolution";

function TransformToChart(data: any) {
  let tempData = data?.map((item: any) => {
    const scoreObj = item.Value.find((val: any) => val.Key === "score");
    const score = scoreObj ? scoreObj.Value : 0;
    let color = "";
    if (score === 4) color = "#22c55e";
    else if (score === -1) color = "#c72323";
    return { name: `Q${item.Key}`, y: score, color };
  });

  return tempData;
}

const Result = () => {
  const queryClient = useQueryClient();
  const [cookie] = useCookies(["accessToken"]);
  const { id } = useParams();
  const [solutionIdx, setSolutionIdx] = useState<number>(0);
  const [mistake, setMistake] = useState<string>("");
  const [attempt, setAttempt] =
    useState<Record<string, Record<string, number>>>();
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isSave, setIsSave] = useState<boolean>(false);
  const [uSolution, setUSolution] = useState<ConvUserSolution>({});
  const [defaultMistake, setDefaultMistake] = useState<string>("");

  const {
    data: result,
    isSuccess,
    isError,
    refetch,
  } = useQuery<TResult>({
    queryKey: [`result/${id}`],
    queryFn: async () => {
      const { data, message, error } = await APIHandler(
        "GET",
        `/board/result/${id}`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        }
      );

      if (error) {
        console.log(message);
        toast({
          title: "Server Error",
          description: "Unable to fetch results",
          variant: "destructive",
        });
        return;
      }

      return data;
    },
  });

  const {
    data: userSolution,
    isLoading: userSolutionLoading,
    isError: userSolutionIsError,
    isSuccess: userSolutionSuccess,
  } = useQuery<TUserSolution>({
    queryKey: [`solution/${id}`],
    queryFn: async () => {
      const { data, error } = await APIHandler("GET", `/solution/${id}`, {
        Authorization: `Bearer ${cookie?.accessToken}`,
      });

      if (error) {
        toast({
          title: "Server Error",
          description: "Unable to fetch user solutions",
          variant: "destructive",
        });
        return;
      }

      return data;
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      if (!mistake) {
        toast({
          title: "Empty Data",
          description: "Please add some description for your note",
          variant: "destructive",
        });
        return;
      }

      const { error } = await APIHandler(
        "POST",
        `/solution`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        },
        {
          quizId: result?.quizId,
          boardId: id,
          questionKey: String(solutionIdx + 1),
          userSolution: {
            [solutionIdx + 1]: {
              solutionText: mistake,
            },
          },
        }
      );

      if (error) {
        toast({
          title: "Server Error",
          description: "Unable to add solution details",
          variant: "destructive",
        });
        return;
      }

      setIsSave(true);
      setMistake("");
      toast({
        title: "Solution Added",
        description: "Solution added for question",
      });
    },
    onMutate: async () => {
      await queryClient.invalidateQueries({
        queryKey: [`/solution/${id}`],
      });
    },
    onSuccess: () => {
      queryClient.cancelQueries({ queryKey: [`/solution/${id}`] });
    },
  });

  useEffect(() => {
    if (isSuccess) {
      setAttempt(TransformQuizAttempt(result?.quizAttempt));
    }
    if (userSolutionSuccess) {
      setUSolution(TransformUserSolution(userSolution?.userSolution));
    }
  }, [isSuccess, userSolutionSuccess]);

  useEffect(() => {
    if (solutionIdx >= 0 && userSolutionSuccess) {
      setDefaultMistake(
        uSolution[String(solutionIdx + 1)]?.solutionText !== undefined
          ? uSolution[String(solutionIdx + 1)]?.solutionText
          : ""
      );
    }
  }, [solutionIdx, userSolutionSuccess]);

  const options = {
    chart: {
      type: "column",
      backgroundColor: "",
    },
    title: {
      text: "Scores",
    },
    xAxis: {
      categories: TransformToChart(result?.quizAttempt)?.map(
        (item: any) => item?.name
      ),
      title: {
        text: null,
      },
    },
    yAxis: {
      min: -2,
      max: 6,
      gridLineDashStyle: "dot",
      title: {
        text: "Scores",
        align: "middle",
      },
      labels: {
        overflow: "justify",
      },
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
        },
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: "score",
        data: TransformToChart(result?.quizAttempt),
      },
    ],
  };

  const handleDiscard = () => {
    setMistake("");
    setIsEmpty(false);
  };

  const handleSave = () => {
    setIsEmpty(false);
    setIsSave(true);
  };

  console.log(uSolution[String(solutionIdx + 1)]?.solutionText);
  if (isError || userSolutionIsError) {
    return (
      <main>
        <Button onClick={() => refetch()}>Retry </Button>
      </main>
    );
  }

  console.log(mistake);

  return (
    <main className="min-h-screen w-full">
      <header className="bg-muted/40 py-4 px-8 space-y-2">
        <h1 className="text-xl font-semibold">
          Result : {result?.quizModel?.title}
        </h1>
      </header>

      <section className="px-8 pt-8 mb-16">
        <div className="border lg:w-1/4 px-4 py-6 bg-muted/50 rounded-lg flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Total Score</h2>
            <h1 className="text-2xl font-semibold">
              {result?.totalScore} / 80
            </h1>
          </div>
          <div className="pr-8">
            <BarChartBigIcon className="w-12 h-12 text-primary" />
          </div>
        </div>
      </section>

      <section className="px-8 space-y-4 my-16">
        <div>
          <h1 className="text-xl">Your Progress</h1>
        </div>
        <div className="grid lg:grid-cols-3 grid-cols-1 w-full gap-8">
          <div className="bg-muted/50 px-4 py-6 rounded-lg lg:w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <RefreshCcwIcon className="h-4 w-4" />
                <h1 className="text-sm font-semibold">Attempted</h1>
              </div>
              <div>
                <h1 className="font-semibold text-lg pr-8">
                  {result?.totalAttempted} / 20
                </h1>
              </div>
            </div>
            <Progress value={(Number(result?.totalAttempted) / 20) * 100} />
          </div>
          <div className="bg-muted/50 px-4 py-6 rounded-lg lg:w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <CircleCheckBigIcon className="h-4 w-4" />
                <h1 className="text-sm font-semibold">Correct</h1>
              </div>
              <div>
                <h1 className="font-semibold text-lg pr-8">
                  {result?.correctAnswers} / {result?.totalAttempted}
                </h1>
              </div>
            </div>
            <Progress
              value={
                (Number(result?.correctAnswers) /
                  Number(result?.totalAttempted)) *
                100
              }
            />
          </div>
          <div className="bg-muted/50 px-4 py-6 rounded-lg lg:w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <CircleOffIcon className="h-4 w-4" />
                <h1 className="text-sm font-semibold">Wrong</h1>
              </div>
              <div>
                <h1 className="font-semibold text-lg pr-8">
                  {result?.wrongAnswers} / {result?.totalAttempted}
                </h1>
              </div>
            </div>
            <Progress
              value={
                (Number(result?.wrongAnswers) /
                  Number(result?.totalAttempted)) *
                100
              }
              color="bg-rose-600/90"
            />
          </div>
          <div className="bg-muted/50 px-4 py-6 rounded-lg lg:w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <SkipForwardIcon className="w-4 h-4" />
                <h1 className="text-base font-semibold">Skipped</h1>
              </div>
              <div>
                <h1 className="font-semibold text-lg pr-8">
                  {20 - Number(result?.totalAttempted)} / 20
                </h1>
              </div>
            </div>
            <Progress
              value={((20 - Number(result?.totalAttempted)) / 20) * 100}
            />
          </div>
          <div className="bg-muted/50 px-4 py-6 rounded-lg lg:w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <ClipboardCheckIcon className="h-4 w-4" />
                <h1 className="text-base font-semibold">Completed</h1>
              </div>
              <div>
                <h1 className="font-semibold text-lg pr-8">
                  {Number((Number(result?.totalAttempted) / 20) * 100).toFixed(
                    2
                  )}{" "}
                  %
                </h1>
              </div>
            </div>
            <Progress value={(Number(result?.totalAttempted) / 20) * 100} />
          </div>
          <div className="bg-muted/50 px-4 py-6 rounded-lg lg:w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <LocateFixedIcon className="h-4 w-4" />
                <h1 className="text-base font-semibold">Accuracy</h1>
              </div>
              <div>
                <h1 className="font-semibold text-lg pr-8">
                  {Number(Number(result?.accuracy) * 100).toFixed(2)} %
                </h1>
              </div>
            </div>
            <Progress value={(Number(result?.totalAttempted) / 20) * 100} />
          </div>
        </div>
      </section>

      <section className="px-8 my-16 space-y-4">
        <div>
          <h1 className="text-xl">Detailed Analysis</h1>
        </div>
        <div className="flex flex-wrap gap-4 ">
          {createNumberRange(1, 20)?.map((item, id) => (
            <Button
              onClick={() => setSolutionIdx(id)}
              key={id}
              size={"icon"}
              className={cn(
                attempt &&
                  String(attempt[String(item - 1)]?.answer) !== "" &&
                  attempt[String(item - 1)]?.score === -1
                  ? "bg-red-900/90 text-white font-semibold hover:bg-red-600"
                  : attempt && attempt[String(item - 1)]?.score === 4
                  ? "bg-green-900/90 text-white font-semibold"
                  : ""
              )}
              variant={
                attempt && attempt[String(item - 1)]
                  ? String(attempt[String(item - 1)]?.answer) === ""
                    ? "secondary"
                    : "default"
                  : "ghost"
              }
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="flex items-center space-x-4 pb-4">
              <div className="border py-2 px-4 rounded-lg bg-muted/100 font-bold">
                {solutionIdx + 1}
              </div>
              <h2 className="lg:text-lg font-sans text-sm">
                {result?.quizModel?.questionModels[solutionIdx]?.text}
              </h2>

              {attempt &&
              String(attempt[String(solutionIdx)]?.answer) ===
                String(
                  result?.quizModel?.questionModels[solutionIdx]?.answer
                ) ? (
                <Badge>Correct</Badge>
              ) : attempt &&
                String(attempt[String(solutionIdx)]?.answer) === "" ? (
                <></>
              ) : (
                <Badge variant={"destructive"}>Incorrect</Badge>
              )}
            </div>
            <RadioGroup
              defaultValue={String(
                result?.quizModel?.questionModels[solutionIdx]?.answer
              )}
              className="space-y-4 pb-8 px-2"
            >
              {result?.quizModel?.questionModels[solutionIdx]?.options?.map(
                (option, idx) => (
                  <div key={idx} className="flex items-center space-x-4 ">
                    <RadioGroupItem
                      value={String(option?.id)}
                      className={cn("accent-neutral-500")}
                      checked={
                        attempt &&
                        (String(attempt[String(solutionIdx)]?.answer) ===
                          String(option?.id) ||
                          String(
                            result?.quizModel?.questionModels[solutionIdx]
                              ?.answer
                          ) === String(option?.id))
                      }
                    />
                    <Label className=" font-sans text-sm">{option?.text}</Label>
                    {String(option?.id) ===
                      String(
                        result?.quizModel?.questionModels[solutionIdx]?.answer
                      ) && <Badge>Correct Answer</Badge>}
                    {attempt &&
                      String(option?.id) ===
                        String(attempt[String(solutionIdx)]?.answer) && (
                        <Badge className="bg-purple-700 text-white hover:bg-purple-600">
                          User Answer
                        </Badge>
                      )}
                  </div>
                )
              )}
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <Textarea
              defaultValue={defaultMistake}
              className="bg-muted resize-y"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMistake(e.target.value)
              }
              placeholder="Type your solution note or mistake here"
              rows={6}
            />
            <div className="flex justify-end">
              <Button
                disabled={mistake.length <= 0}
                onClick={() => mutateAsync()}
                size={"sm"}
                className="w-[10%]"
              >
                Save
              </Button>
            </div>
          </div>
          <div className="space-x-4 flex items-center py-2 mt-8 justify-end border-t-2">
            <Button
              variant={"secondary"}
              size={"icon"}
              disabled={solutionIdx === 0}
              onClick={() => {
                if (mistake?.length > 0 && !isSave) {
                  setIsEmpty(true);
                  return;
                }
                setMistake("");
                setIsSave(false);
                setSolutionIdx((prev) => Math.max(prev - 1, 0));
              }}
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
            <Button
              size={"icon"}
              variant={"secondary"}
              onClick={() => {
                if (mistake?.length > 0 && !isSave) {
                  setIsEmpty(true);
                  return;
                }
                setMistake("");
                setIsSave(false);
                setSolutionIdx((prev) => Math.min(prev + 1, 20));
              }}
              disabled={solutionIdx === 19}
            >
              <MoveRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="px-8 space-y-4 mb-8">
        <div className="text-xl">
          <h1>Quiz Attempt Flow</h1>
        </div>
        <div className="bg-muted/50 rounded-lg">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </section>
      <Dialog open={isEmpty} onOpenChange={() => setIsEmpty(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Unchanged Save</DialogTitle>
          </DialogHeader>
          <div>
            <h2>
              Your note for question no. {solutionIdx + 1} is unsaved. Please
              mark note as saved.
            </h2>
          </div>
          <DialogFooter>
            <Button onClick={handleDiscard} variant={"destructive"}>
              Discard
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Result;
