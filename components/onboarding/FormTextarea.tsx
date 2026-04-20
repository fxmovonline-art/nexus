interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  maxLength?: number;
  rows?: number;
}

export default function FormTextarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  maxLength,
  rows = 5,
}: FormTextareaProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      <div className="flex items-center justify-between mt-2">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {maxLength && (
          <p className="text-xs text-gray-500 ml-auto">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
