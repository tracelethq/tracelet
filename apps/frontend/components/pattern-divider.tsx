import { cn } from "@/lib/utils";
import Decorations from "./ui/decorations";

const PatternDivider = ({
  direction = "horizontal",
  size = 14,
}: {
  direction?: "horizontal" | "vertical";
  size?: number;
}) => {
  return (
    <div
      className={cn(
        "bg-stripe-pattern relative border",
        direction === "horizontal" ? `w-full h-${size}` : `w-${size} h-full`,
      )}
    >
        <Decorations/>
    </div>
  );
};

export default PatternDivider;
