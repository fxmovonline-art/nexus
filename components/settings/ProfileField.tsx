interface ProfileFieldProps {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: string;
  readonly?: boolean;
}

export default function ProfileField({
  label,
  value,
  isEditing = false,
  onChange,
  type = 'text',
  readonly = false,
}: ProfileFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {isEditing && !readonly ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      ) : (
        <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">{value}</p>
      )}
    </div>
  );
}
