import IOption from "@/types/IOption";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@radix-ui/react-label";

interface Props {
  currIdx: number;
  options: IOption[];
  onSelectAnswer: (answer: string) => void;
  defaultAnswer: string | undefined;
}

const Option = ({ options, onSelectAnswer, currIdx, defaultAnswer }: Props) => {
  return (
    <RadioGroup
      key={currIdx}
      className="my-8 space-y-4"
      onValueChange={(value) => onSelectAnswer(value)}
      defaultValue={defaultAnswer}
    >
      {options?.map((option, idx) => (
        <div key={idx} className="flex items-center space-x-8">
          <RadioGroupItem value={String(option?.id)} id={`r-${option?.id}`} />
          <Label htmlFor={`r-${option?.id}`} className="font-serif text-lg">
            {option?.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default Option;
