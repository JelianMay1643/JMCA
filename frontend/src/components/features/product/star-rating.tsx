import { Star } from "lucide-react";

type Props = {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
};

function StarRating({ value, size = 16, onChange }: Props) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          onClick={onChange ? () => onChange(n) : undefined}
          className={`${onChange ? "cursor-pointer" : ""} ${
            n <= Math.round(value)
              ? "fill-yellow-400 stroke-yellow-400"
              : "fill-none stroke-neutral-400"
          }`}
        />
      ))}
    </span>
  );
}

export default StarRating;