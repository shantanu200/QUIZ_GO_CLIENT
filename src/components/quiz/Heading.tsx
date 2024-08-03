import { ModeToggle } from "../mode-toggle";

const QuizHeading = ({ title }: { title: string }) => {
  return (
    <div className="w-full h-[10vh] flex items-center justify-between dark:bg-muted/40 p-8  border-b-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div>
        <ModeToggle />
      </div>
    </div>
  );
};

export default QuizHeading;
