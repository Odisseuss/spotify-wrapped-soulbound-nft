import React from "react";
import Minter from "../Minter/Minter";
import { useSpotify } from "../../utils/useSpotify";
import useSessionStorage from "../../utils/useSessionState";

function App() {
  const { value: isAuthenticated, setValue: setIsAuthenticated } =
    useSessionStorage("isAuthenticated", false);
  useSpotify(isAuthenticated);

  const logIn = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      {isAuthenticated ? (
        <Minter />
      ) : (
        <>
          <img
            src="/wrapped-completed.jpg"
            alt="spotify-wrapped-completed"
            className="w-1/6 background absolute z-0 rotate-[-20deg] left-1/3 top-2/3 -translate-y-1/2 -translate-x-1/2"
          />
          <img
            src="/wrapped-hidden.png"
            alt="spotify-wrapped-hidden"
            className="w-1/6 background absolute z-0 rotate-[37deg] right-1/3 top-2/3 -translate-y-1/2 translate-x-1/2"
          />
          <div className="w-screen h-screen bg-zinc-950 overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center z-10 relative">
              <h1 className="text-6xl font-bold text-white mb-4">
                Your own Soulbound
              </h1>
              <h1 className="text-4xl font-bold text-white mb-20">
                Spotify Wrapped NFT
              </h1>
              <button
                onClick={logIn}
                className="bg-spotify text-black rounded-full flex items-center justify-center px-4 py-2 font-medium mt-10"
              >
                <img
                  src="/spotify-logo.png"
                  alt="spotify-icon"
                  className="w-6 mr-3"
                />
                Log In
              </button>
            </div>
            <a
              href="https://www.flaticon.com/free-icons/spotify-sketch"
              title="spotify sketch icons"
              className="text-gray-600"
            >
              Spotify sketch icons created by Freepik - Flaticon
            </a>
          </div>
        </>
      )}
    </>
  );
}
export default App;
