import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "../ui/use-toast";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@tanstack/react-query";
import APIHandler from "@/server/API";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { TUser } from "@/types/User";
import { PasswordInput } from "../ui/passwordInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useState } from "react";
import localStore from "@/localStore/Store";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "Password must contain 6 Character",
    })
    .max(30, {
      message: "Password must not be longer than 30 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const { toast } = useToast();
  const [cookie] = useCookies(["accessToken"]);

  const { data } = useQuery<TUser>({
    queryKey: ["user"],
    queryFn: async () => {
      const { error, data, message } = await APIHandler("GET", "/user", {
        Authorization: `Bearer ${cookie?.accessToken}`,
      });

      if (error) {
        toast({
          title: "User Not Found",
          description: message,
          variant: "destructive",
        });
        return;
      }

      return data;
    },
  });

  const handleAPI = async (body: TUser) => {
    const { data, message, error } = await APIHandler(
      "PATCH",
      "/user",
      {
        Authorization: `Bearer ${cookie?.accessToken}`,
      },
      {
        name: body?.name,
        email: body?.email,
        password: body?.password,
      }
    );

    if (error) {
      toast({
        title: "Server Error",
        description: message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Details Updted",
      description: message,
    });
    return data;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: handleAPI,
  });

  if (data) {
    return (
      <ProfileFormElement
        user={data}
        mutate={mutateAsync}
        isPending={isPending}
      />
    );
  }

  return <Loader2Icon className="animate-spin h-8 w-8" />;
}

const ProfileFormElement = ({
  user,
  mutate,
  isPending,
}: {
  user: TUser;
  mutate: (data: TUser) => void;
  isPending: boolean;
}) => {
  const store = localStore((state) => state);
  const [cookie, _, removeCookie] = useCookies(["accessToken"]);
  const [modal, setModal] = useState<boolean>(false);
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
      password: user?.password,
    },
    mode: "onChange",
  });
  function onSubmit(data: ProfileFormValues) {
    mutate(data);
  }

  const handleDeleteAPI = async () => {
    const { error, data } = await APIHandler("DELETE", "/user", {
      Authorization: `Bearer ${cookie?.accessToken}`,
    });

    if (error) {
      toast({
        title: "Server Error",
        description: "Unable to delete user",
        variant: "destructive",
      });
      return;
    }
    store.setIsLoggedIn(false);
    removeCookie("accessToken", {
      path: "/",
    });
    return data;
  };

  const { mutateAsync: deleteAction } = useMutation({
    mutationFn: handleDeleteAPI,
  });
  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mr. Mahesh Babu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled placeholder="mah*****@gmail.com" {...field} />
                </FormControl>
                <FormDescription>
                  You can manage verified email addresses in your{" "}
                  <Link to="/examples/forms">email settings</Link>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    type="password"
                    placeholder="shadcn"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-4">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isDirty}
              type="submit"
              size={"sm"}
            >
              Update profile
            </Button>
            <Button
              variant={"destructive"}
              onClick={() => {
                setModal(true);
              }}
              className="space-x-2"
              size={"sm"}
            >
              <Trash2Icon size={16} />
              <span>Delete Profile</span>
            </Button>
          </div>
        </form>
      </Form>
      <AlertDialog open={modal} onOpenChange={() => setModal(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAction()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
