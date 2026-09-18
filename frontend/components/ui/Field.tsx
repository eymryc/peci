import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-peci-dark placeholder:text-peci-grey/70 transition-colors focus:border-peci-teal focus:outline-none focus:ring-2 focus:ring-peci-teal/20";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({ label, error, required, hint, children, className }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-peci-dark">
          {label} {required && <span className="text-peci-green">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-peci-grey">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(fieldBase, error && "border-red-400 focus:border-red-500 focus:ring-red-200", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-[120px] resize-y", error && "border-red-400 focus:border-red-500 focus:ring-red-200", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
>(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldBase, "appearance-none bg-no-repeat", error && "border-red-400", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
