import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-normal cursor-pointer transition-colors duration-200 whitespace-nowrap active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none rounded-full text-sm leading-5",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary border border-primary hover:bg-ink-hover py-1 px-3",
        outline:
          "bg-transparent text-ink border border-hairline hover:border-ink/25 py-2 px-4",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}
