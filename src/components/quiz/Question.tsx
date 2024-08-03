interface Props {
  question: string;
}

const Question = ({ question }: Props) => {
  return (
    <div>
      <h2 className="text-xl font-serif">{question}</h2>
    </div>
  );
};

export default Question;
