import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const DecorationsVariant = cva("", {
  variants: {
    variant: {
      default: "bg-muted-foreground",
      primary: "bg-primary",
    },
  },
});

const Decorations = ({
  topRight = true,
  bottomRight = true,
  bottomLeft = true,
  topLeft = true,
  variant = "default",
  className,
  isAbsolute = false,
}: {
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
  variant?: "default" | "primary";
  className?: string;
  isAbsolute?: boolean;
}) => {
  return (
    <span className={cn(className,{"absolute inset-0 -z-1": isAbsolute})}>
      {topLeft && (
        <span className={cn("absolute -left-px -top-px z-10")}>
        <span className="relative">
          <span className={cn("w-px h-[7.87px] rounded-full absolute top-0",DecorationsVariant({ variant }))}/>
            <span className={cn("w-[7.87px] h-px rounded-full absolute left-0",DecorationsVariant({ variant }))}/>
          </span>
        </span>
      )}
      {topRight && (
          <span className={cn("absolute -right-px -top-px z-10")}>
        <span className="relative">
          <span className={cn("w-px h-[7.87px] rounded-full absolute top-0",DecorationsVariant({ variant }))}/>
          <span className={cn("w-[7.87px] h-px rounded-full absolute -left-[7px]",DecorationsVariant({ variant }))}/>
        </span>
      </span>
      )}
      {bottomLeft && (
      <span className={cn("absolute -left-px -bottom-px z-10")}>
        <span className="relative">
          <span className={cn("w-px h-[7.87px] rounded-full absolute -top-[7px]",DecorationsVariant({ variant }))}/>
          <span className={cn("w-[7.87px] h-px rounded-full absolute left-0",DecorationsVariant({ variant }))}/>
        </span>
      </span>
      )}
      {bottomRight && (
      <span className={cn("absolute -right-px -bottom-px z-10")}>
        <span className="relative">
          <span className={cn("w-px h-[7.87px] rounded-full absolute -top-[7px]",DecorationsVariant({ variant }))}/>
          <span className={cn("w-[7.87px] h-px rounded-full absolute -left-[7px]",DecorationsVariant({ variant }))}/>
        </span>
      </span>
      )}
    </span>
  );
};

export default Decorations;
