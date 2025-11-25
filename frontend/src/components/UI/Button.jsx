export default function Button({ children, className, ...props }) {
  return (
    <button
      {...props}
      className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
}
