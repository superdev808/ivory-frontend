
import { useState, useRef } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import SearchBar from "../searchBar";
import useOutsideClick from "@/hooks/useOutsideClick";
import useCheckMobileScreen from "@/hooks/useCheckMobileScreen";
const Navigation = () => {
  // toggle sidebar
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef(null);


  const navLinks = [
      // {id: 'home',title: 'Home', link: '/'},
      // {id:'search',title: 'Search', link: '/search'},
      {id:'flows',title: 'Flows', link: '/flows'},

  ]

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu: () => void = () => {
    setIsOpen(false);
  };


  useOutsideClick(boxRef, closeMenu);
  useCheckMobileScreen(closeMenu);

  return (
    <div ref={boxRef}>
      
      <Sidebar isOpen={isOpen} toggle={toggle} navLinks={navLinks} />
      <Navbar isOpen={isOpen} toggle={toggle} navLinks={navLinks}/>
      
    </div>
  );
};

export default Navigation;