import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import APIHandler from "@/server/API";
import { TResult } from "@/types/TResult";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, LoaderCircleIcon, Tally5Icon } from "lucide-react";

import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";

const LeaderBoard = () => {
  const { id } = useParams();
  const cookie = useCookies(["accessToken"]);
  const { data, isLoading, isError } = useQuery<TResult[]>({
    queryKey: [`leaderboard/662572a1b99bdc146e3e50e7`],
    queryFn: async () => {
      const { data, message, error } = await APIHandler(
        "GET",
        `/board/leaderboard/662572a1b99bdc146e3e50e7`,
        {
          Authorization: `Bearer ${cookie?.[0]?.accessToken}`,
        }
      );

      if (error) {
        console.error(message);
        toast({
          title: "Server Error",
          description: "Unable to fetch leaderboard",
          variant: "destructive",
        });
        return;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <LoaderCircleIcon className="animate-spin h-12 w-12" />
      </main>
    );
  }
  return (
    <main className="p-4">
      <Card x-chunk="dashboard-06-chunk-0" className="bg-muted/40">
        <CardHeader>
          <CardTitle>LeaderBoard</CardTitle>
          <CardDescription>
            See your all test scores and rank here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((result, idx) => (
                <TableRow
                  key={result?.id}
                  className={cn(idx + 1 <= 3 ? "bg-muted/30" : "")}
                >
                  <TableCell>
                    <h3 className={cn(idx + 1 <= 3 ? "text-xl font-bold" : "")}>
                      {idx + 1 > 9 ? idx + 1 : "0" + String(idx + 1)}
                    </h3>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {result?.User?.name?.split(" ")[0]?.[0] +
                            result?.User?.name?.split(" ")[1]?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <h1>{result?.User?.name}</h1>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tally5Icon className="h-4 w-4" />
                      <span>{result?.totalScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-sm" variant={"secondary"}>
                      {(result?.accuracy * 100).toFixed(2)} %
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default LeaderBoard;
