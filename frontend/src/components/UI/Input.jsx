export default function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 text-gray-700">{label}</label>}
      <input
        {...props}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
