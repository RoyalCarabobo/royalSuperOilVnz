// src/components/Buttom.js
export default function Buttom({ label, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 mt-1 py-2 px-5 sm:px-8 lg:px-10 bg-blue-600 text-white font-bold rounded-xl shadow-lg text-sm lg:text-base transition-all active:scale-95 duration-300 ease-in-out cursor-pointer hover:bg-foreground hover:text-black"
    >
      {label}
    </button>
  );
}