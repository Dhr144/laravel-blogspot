import { Link } from "wouter";
import { Facebook, Twitter, Github, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-base text-gray-500">&copy; {currentYear} BlogWave. All rights reserved.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link href="#">
              <a className="text-gray-500 hover:text-gray-900">Privacy Policy</a>
            </Link>
            <Link href="#">
              <a className="text-gray-500 hover:text-gray-900">Terms of Service</a>
            </Link>
            <Link href="#">
              <a className="text-gray-500 hover:text-gray-900">Contact Us</a>
            </Link>
          </div>
          <p className="mt-8 text-base text-gray-500 md:mt-0 md:order-1">
            Built with Express and React. Designed with ❤️.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
