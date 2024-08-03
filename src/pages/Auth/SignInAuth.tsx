import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LazyLoadImage } from "react-lazy-load-image-component";
import FormImage from "@/assets/signup.jpg";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorText from "@/common/ErrorText";
import { useMutation } from "@tanstack/react-query";
import APIHandler from "@/server/API";
import { useToast } from "@/components/ui/use-toast";
import { Loader2Icon } from "lucide-react";
import { useCookies } from "react-cookie";
import localStore from "@/localStore/Store";
import { PasswordInput } from "@/components/ui/passwordInput";

type FormFields = {
  email: string;
  password: string;
};

const FormValidationSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty("Please enter password"),
});

type SignUpSchemaType = z.infer<typeof FormValidationSchema>;

export default function SignInAuthPage() {
  const [, setCookie] = useCookies(["accessToken"]);
  const store = localStore((state) => state);
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(FormValidationSchema),
  });

  const handleAPI = async (body: FormFields) => {
    const { error, message, data } = await APIHandler(
      "POST",
      "/user/login",
      {},
      {
        email: body?.email,
        password: body?.password,
      }
    );

    if (error) {
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      return;
    }
    setCookie("accessToken", data?.accessToken, {
      path: "/",
      expires: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    });
    store.setIsLoggedIn(true);
    navigate("/user");
    return data;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: handleAPI,
  });

  const handleForm = handleSubmit(async (data: FormFields) => {
    mutateAsync(data);
  });

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign IN</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleForm} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors?.email?.message && (
                <ErrorText errorText={errors.email?.message} />
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <PasswordInput id="password" {...register("password")} />
              {errors?.password?.message && (
                <ErrorText errorText={errors?.password?.message} />
              )}
            </div>
            <Button type="submit" className="w-full space-x-2">
              {isPending && <Loader2Icon className="animate-spin" />}
              <span>Submit</span>
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/auth/register" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {/* <Image
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        /> */}
        <LazyLoadImage src={FormImage} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
