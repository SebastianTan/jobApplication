"use client";

type TimeInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function TimeInput({ value, onChange, className = "" }: TimeInputProps) {
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    // Allow typing HH:mm format
    if (/^\d{0,2}(:\d{0,2})?$/.test(input)) {
      onChange(input);
    }
  }

  function handleInputFocus() {
    if (!value) {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      onChange(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }

  return (
    <input
      type="text"
      className={className}
      value={value}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      placeholder="HH:mm"
      maxLength={5}
    />
  );
}
