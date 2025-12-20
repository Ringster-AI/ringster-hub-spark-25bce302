import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] text-white py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <p className="text-sm text-gray-300">© Ringster 2025. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
