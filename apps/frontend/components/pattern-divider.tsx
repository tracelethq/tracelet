import { cn } from "@/lib/utils";
import Decorations from "./ui/decorations";

const PatternDivider = ({
  direction = "horizontal",
  size = 14,
  children,
  className,
}: {
  direction?: "horizontal" | "vertical";
  size?: number;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-stripe-pattern relative border",
        direction === "horizontal" ? `w-full h-${size}` : `w-${size} h-full`,
        className,
      )}
    >
        <Decorations/>
        {children}
    </div>
  );
};

export default PatternDivider;
