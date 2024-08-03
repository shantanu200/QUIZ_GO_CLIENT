import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  Form,
  FormLabel,
} from "@/components/ui/form";

import { useToast } from "@/components/ui/use-toast";
import { instructions, scoringInstructions } from "@/data/Instruction";
import { cn } from "@/lib/utils";
import localStore from "@/localStore/Store";
import APIHandler from "@/server/API";
import IQuiz from "@/types/TQuiz";
import { TUserStatus } from "@/types/TUserQuizStatus";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarCheck2Icon,
  CheckCircle2Icon,
  CircleHelpIcon,
  Clock10Icon,
  Loader2Icon,
  LockOpenIcon,
} from "lucide-react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const FormSchema = z.object({
  terms: z.boolean().default(false),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const TestDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [cookie] = useCookies(["accessToken"]);
  const { toast } = useToast();
  const [modal, setModal] = useState<boolean>(false);
  const { boardId, setBoardId } = localStore((state) => state);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      terms: false,
    },
  });
  const { data: quiz, isLoading } = useQuery<IQuiz>({
    queryKey: [`quiz/${state?.quizId}`],
    queryFn: async () => {
      const { data, error, message } = await APIHandler(
        "GET",
        `/quiz/${state?.quizId}`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        }
      );

      if (error) {
        console.log(message);
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

  const { data: userQuizStatus } = useQuery<TUserStatus>({
    queryKey: [`userQuizStatus/${state?.quizId}`],
    queryFn: async () => {
      const { data, error, message } = await APIHandler(
        "GET",
        `/board/details/${state?.quizId}`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        }
      );

      if (error) {
        console.log(message);
        toast({
          title: "Server Error",
          description: "Unable to fetch quiz status for user",
          variant: "destructive",
        });
        return;
      }
      if (data?.boardId) {
        setBoardId(data?.boardId);
      } else {
        setBoardId("");
      }
      return data;
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      const { error, message, data } = await APIHandler(
        "POST",
        "/board",
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        },
        {
          quizId: state?.quizId,
        }
      );

      if (error) {
        toast({
          title: "Connect Error",
          description: message,
          variant: "destructive",
        });
        return;
      }

      if (boardId === "") {
        setBoardId(data?.boardId);
      }

      navigate("/quiz", {
        state: {
          quizId: quiz?.id,
        },
      });
      return data;
    },
  });

  const handleForm = form.handleSubmit((data) => {
    console.log(data.terms);
    if (data.terms === undefined || data.terms === false) {
      toast({
        title: "Terms and Instructions",
        description: "Please accept terms and instructions",
        variant: "destructive",
      });
      return;
    } else if (userQuizStatus?.isStart && userQuizStatus?.isActive) {
      navigate("/quiz", {
        state: {
          quizId: quiz?.id,
        },
      });
    } else {
      mutateAsync();
    }
  });

  if (isLoading) return <Loader2Icon className="animate-spin h-8 w-8" />;

  const buttonKeywordStatus = () => {
    if (userQuizStatus?.isOver && !userQuizStatus?.isActive) {
      return "Quiz Completed";
    } else if (userQuizStatus?.isActive && !userQuizStatus?.isOver) {
      return "Resume Quiz";
    } else {
      return "Start Quiz";
    }
  };
  return (
    <main className="px-4 py-8 sm:px-6">
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-4">
              <h1>{quiz?.title}</h1>
              <LockOpenIcon className="h-4 w-4" />
              <Badge variant={"outline"} className="text-primary">
                Available
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>{quiz?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-8">
            <div className="flex items-center space-x-2">
              <CalendarCheck2Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{quiz?.initDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CircleHelpIcon className="h-4 w-4 text-muted-foreground text-purple-600" />
              <span className="text-sm">{quiz?.totalQuestion} questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock10Icon className="h-4 w-4 text-muted-foreground text-rose-600" />
              <span className="text-sm">{quiz?.duration} mins</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2Icon className="h-4 w-4 text-muted-foreground text-green-600" />
              <span className="text-sm">{quiz?.maxScore}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-4">
              {userQuizStatus?.isOver ? (
                <div className="flex items-center">
                  <h1>Results:</h1>
                  <Button variant={"link"} onClick={() => navigate(`/result/${userQuizStatus?.boardId}`)}>
                    {userQuizStatus?.totalScore}/60
                  </Button>
                </div>
              ) : (
                <Button
                  className=""
                  size={"lg"}
                  disabled={
                    userQuizStatus?.isStart && !userQuizStatus?.isActive
                  }
                  onClick={() => setModal(true)}
                >
                  {buttonKeywordStatus()}
                </Button>
              )}
            </div>
            <span
              className={cn(
                "text-sm italic",
                userQuizStatus?.isOver ? "text-rose-600 font-semibold" : ""
              )}
            >
              {userQuizStatus?.isOver ? 0 : 1} Attempt remaining to complete
              quiz
            </span>
          </div>
        </CardFooter>
      </Card>
      <Card className="my-4 bg-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
          <CardDescription className="text-xs">
            Please read instruction carefully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="px-4 list-disc space-y-2 mb-4">
            {instructions?.map((item, idx) => (
              <li key={idx} className="text-sm">
                {item}
              </li>
            ))}
          </ul>
          <div>
            <h1 className="text-sm font-bold pb-2">Scoring Instructions</h1>
            <ul className="px-16 list-disc space-y-2">
              {scoringInstructions?.map((item, idx) => (
                <li key={idx} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      <Dialog open={modal} onOpenChange={() => setModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-semibold text-xl">
              Start Quiz
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <Form {...form}>
              <form onSubmit={handleForm}>
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel>
                          I agree all terms and instructions.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size={"lg"}>
                  Continue
                </Button>
                <p className="text-muted-foreground italic text-sm text-center pt-2">
                  1 attempt is remaining!
                </p>
              </form>
            </Form>
          </DialogDescription>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default TestDetailsPage;
