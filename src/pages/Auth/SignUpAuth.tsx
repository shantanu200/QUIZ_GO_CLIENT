import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormImage from "@/assets/signin.jpg";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/passwordInput";
import ErrorText from "@/common/ErrorText";
import APIHandler from "@/server/API";
import { useToast } from "@/components/ui/use-toast";
import { useCookies } from "react-cookie";
import localStore from "@/localStore/Store";
import { useMutation } from "@tanstack/react-query";

type FormFields = {
  name: string;
  email: string;
  password: string;
};

const FormValidationSchema = z.object({
  name: z.string().nonempty("Please enter valid name"),
  email: z.string().email(),
  password: z
    .string()
    .nonempty("Please enter password")
    .min(6, "Password must contain 6 charcters")
    .max(30, "Password must contain max 30 characters"),
});

type SignUpSchemaType = z.infer<typeof FormValidationSchema>;

export default function SignUpAuthPage() {
  const [, setCookie] = useCookies(["accessToken"]);
  const store = localStore((state) => state);
  const navigate = useNavigate();
  const { toast } = useToast();
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
      "/user",
      {},
      {
        name: body?.name,
        email: body?.email,
        password: body?.password,
      }
    );

    if (error) {
      toast({
        title: "Sign UP Failed",
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
            <h1 className="text-3xl font-bold">Sign UP</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to login to create account
            </p>
          </div>
          <form onSubmit={handleForm} className="grid gap-4" autoComplete="off">
            <div className="grid gap-2">
              <Label htmlFor="email">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mr. Ranker 1"
                autoComplete="off"
                {...register("name")}
              />
              {errors?.name?.message && (
                <ErrorText errorText={errors.name?.message} />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="r@example.com"
                autoComplete="off"
                {...register("email")}
              />
              {errors?.email?.message && (
                <ErrorText errorText={errors.email?.message} />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                type="password"
                autoComplete="off"
                maxLength={30}
                {...register("password")}
              />
              {errors?.password?.message && (
                <ErrorText errorText={errors.password?.message} />
              )}
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/login" className="underline">
              Sign In
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
