function Button({ type, onClick, children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-green-800 text-gray-100 rounded px-4 py-2 hover:bg-gray-700"
    >
      {children}
    </button>
  );
}

export default Button;
