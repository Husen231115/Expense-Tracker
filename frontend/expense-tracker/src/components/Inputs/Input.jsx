import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"; 

const Input = ({ value, label, onChange, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="text-[13px] text-slate-800 block mb-1">{label}</label>

      {/* Input box */}
      <div className="relative w-full">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
          value={value}
          onChange={(e) => onChange(e)}
        />

        {/* Toggle Password Icon - Ensure it's inside the input field */}
        {type === "password" && (
          <span
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? (
              <FaRegEye size={20} className="text-primary" />
            ) : (
              <FaRegEyeSlash size={20} className="text-slate-400" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
