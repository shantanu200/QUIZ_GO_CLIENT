import { cn } from "@/lib/utils";

interface Props {
  time: number;
}

const Timer = ({ time }: Props) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="py-2 px-4 select-none">
      {minutes >= 0 && seconds >= 0 ? (
        <h2 className="text-lg font-semibold space-x-2">
          <span className={cn(time <= 300 ? "text-rose-600" : "")}>{`${
            minutes <= 9 ? "0" + minutes : minutes
          }`}</span>
          <span className={cn(time <= 300 ? "text-rose-600" : "")}>:</span>
          <span className={cn(time <= 300 ? "text-rose-600" : "")}>{`${
            seconds <= 9 ? "0" + seconds : seconds
          }`}</span>
        </h2>
      ) : (
        <p>Time Over</p>
      )}
    </div>
  );
};

export default Timer;
