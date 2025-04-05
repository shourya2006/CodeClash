import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Navbar from "./components/Navbar.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";
import Contact from "./components/Contact.jsx";
import CreateRoom from "./components/CreateRoom.jsx";
import JoinRoom from "./components/JoinRoom.jsx";
import Room from "./components/Room.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: (
      <>
        <Navbar /> <About /> <Footer />
      </>
    ),
  },
  {
    path: "/contact",
    element: (
      <>
        <Navbar /> <Contact /> <Footer />
      </>
    ),
  },
  {
    path: "/create",
    element: (
      <>
        <Navbar /> <CreateRoom /> <Footer />
      </>
    ),
  },
  {
    path: "/join",
    element: (
      <>
        <Navbar /> <JoinRoom /> <Footer />
      </>
    ),
  },
  {
    path: "/room/:roomId",
    element: (
      <>
        <Navbar /> <Room /> <Footer />
      </>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
