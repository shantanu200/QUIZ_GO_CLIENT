import { Separator } from "@/components/ui/separator";
import { DocsSidebarNav } from "@/common/SidebarNav";
import ProfileForm from "@/components/forms/ProfileForm";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/user/settings",
    items: [],
  },
];

export default function UserSettings() {
  return (
    <>
      <div className="md:hidden"></div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Update your profile details here.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          {/* <aside className="-mx-4 lg:w-1/5">
            <DocsSidebarNav items={sidebarNavItems} />
          </aside> */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="space-y-6">
              <ProfileForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
