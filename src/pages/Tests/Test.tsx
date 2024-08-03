import {
  CircleHelpIcon,
  Clock9Icon,
  ListFilter,
  LockIcon,
  Search,
} from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import APIHandler from "@/server/API";
import { useCookies } from "react-cookie";
import { useToast } from "@/components/ui/use-toast";
import React, { useCallback, useState } from "react";
import { TPagination } from "@/types/Pagination";
import _ from "lodash";
import { useNavigate } from "react-router-dom";

export function TestPage() {
  const navigate = useNavigate();
  const [cookie] = useCookies(["accessToken"]);

  const { toast } = useToast();

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [query, setQuery] = useState<string>("");

  const { data } = useQuery<TPagination>({
    queryKey: ["quizzes", page, limit, query],
    queryFn: async () => {
      const { data, error } = await APIHandler(
        "GET",
        `/quiz?page=${page}&limit=${limit}&q=${query}`,
        {
          Authorization: `Bearer ${cookie?.accessToken}`,
        }
      );

      if (error) {
        toast({
          title: "Quizzes Not Found",
          description: "Unable to get quizess",
        });
        return;
      }

      return data;
    },
  });

  const handleQuery = useCallback(
    _.debounce((value) => setQuery(value), 800),
    []
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Completed</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Resume
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                  <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuery(e.target.value)
                      }
                    />
                  </div>
                </header>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0" className="bg-muted/40">
                <CardHeader>
                  <CardTitle>Quizzes</CardTitle>
                  <CardDescription>
                    Manage your quiz and view their  performance and score.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Image</span>
                          Sr. No
                        </TableHead>
                        <TableHead className="w-1/3">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Questions
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Duration
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Due Date
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.results?.map((quiz, idx) => (
                        <TableRow>
                          <TableCell className="hidden sm:table-cell">
                            <h1 className="font-semibold text-2xl">
                              {idx + 1 + (page - 1) * limit > 9
                                ? idx + 1 + (page - 1) * limit
                                : "0" + String(idx + 1 + (page - 1) * limit)}
                            </h1>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="space-y-2">
                              <p>{quiz?.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {quiz.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={"secondary"}>
                              <LockIcon className="h-4 w-4 text-yellow-400" />
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center space-x-2">
                              <CircleHelpIcon size={12} />
                              <span>{quiz?.totalQuestion} ques</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center space-x-2">
                              <Clock9Icon size={12} />
                              <span>{quiz?.duration} mins</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {quiz?.dueDate}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            <Button
                              size={"sm"}
                              variant={"secondary"}
                              onClick={() =>
                                navigate("/user/tests/quiz", {
                                  state: {
                                    quizId: quiz?.id,
                                  },
                                })
                              }
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="w-full flex justify-between">
                  <div className="text-xs text-muted-foreground">
                    Showing{" "}
                    <strong>
                      {(page - 1) * limit + 1} -{" "}
                      {Math.min(
                        (page - 1) * limit + 10,
                        Number(data?.totalResults)
                      )}
                    </strong>{" "}
                    of <strong>{data?.totalResults}</strong> Quizzes
                  </div>
                  <div className="flex space-x-4 pr-12">
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      className="w-1/2"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size={"sm"}
                      disabled={
                        Math.ceil(Number(data?.totalResults) / limit) === page
                      }
                      variant={"outline"}
                      className="w-1/2"
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
