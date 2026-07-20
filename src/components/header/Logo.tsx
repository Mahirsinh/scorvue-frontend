import { Link } from "react-router-dom";
import logo from "../../assets/logo.png"; // adjust the path if needed

export const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center transition-all duration-300"
    >
      <img
        src={logo}
        alt="SCORVUE"
        className="h-22 w-auto object-contain transition-transform duration-300 hover:scale-105 ml-6"
        draggable={false}
      />
    </Link>
  );
};