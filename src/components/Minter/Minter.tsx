import React, { useEffect, useState } from "react";
import { useSpotify } from "../../utils/useSpotify";
import {
  createWrappedAndUploadToIpfs,
  uploadNftToIpfs,
} from "../../utils/wrappedImageGenerator";
import { useCall, useContractFunction, useEthers } from "@usedapp/core";
import { MinterContract, useDappConfig } from "../../utils/config";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { unpinFromIpfs } from "../../utils/requests";

function Minter() {
  const [generatedImageBlob, setGeneratedImageBlob] = useState<Blob>();
  const [isMintingNft, setIsMintingNft] = useState<boolean>(false);
  const sdk = useSpotify();
  const { account, activateBrowserWallet, chainId } = useEthers();
  const { send: sendMintTransaction } = useContractFunction(
    MinterContract,
    "safeMint"
  );
  const { send: sendBurnTransaction } = useContractFunction(
    MinterContract,
    "burn"
  );

  const { value: tokenBalance } =
    useCall({
      contract: MinterContract,
      method: "tokensOfOwner",
      args: [account],
    }) ?? {};

  const results = useCall({
    contract: MinterContract,
    method: "tokenURI",
    args: [tokenBalance?.[0]?.[0]],
  });

  const removePastNFTAssets = async () => {
    if (results) {
      try {
        const res = await axios.get(results.value[0]);
        await unpinFromIpfs(results.value[0].split("/").pop());
        await unpinFromIpfs(res.data.image.split("/").pop());
      } catch (err) {
        toast.error("Something went wrong");
      }
    }
  };

  useEffect(() => {
    if (chainId && !useDappConfig.readOnlyUrls?.[chainId]) {
      toast.error("Please connect using Sepolia Testnet");
    }
  });

  const getTopGenre = (genreArrays: string[][] | undefined): string | null => {
    if (!genreArrays) {
      return null;
    }
    const genreCounts: any = {};

    genreArrays.flat().forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    let topGenre = null;
    let maxCount = 0;

    for (const genre in genreCounts) {
      if (genreCounts[genre] > maxCount) {
        maxCount = genreCounts[genre];
        topGenre = genre;
      }
    }

    return topGenre;
  };

  const getTopArtists = async () => {
    const result = await sdk?.currentUser.topItems("artists", "medium_term", 5);
    const genres = result?.items.map((item) => item.genres);
    return {
      image: result?.items[0].images[0],
      topArtists: result?.items.map((item) => item.name),
      genre: getTopGenre(genres),
    };
  };

  const getTopSongs = async () => {
    const result = await sdk?.currentUser.topItems("tracks", "medium_term", 5);
    return result?.items.map((item) => item.name);
  };

  const mintNft = async () => {
    try {
      setIsMintingNft(true);
      const topArtistData = await getTopArtists();
      const topSongsData = await getTopSongs();
      const imageBlob = await createWrappedAndUploadToIpfs(
        topArtistData,
        topSongsData
      );
      setGeneratedImageBlob(imageBlob);
      const metadataHash = await uploadNftToIpfs(imageBlob);
      if (tokenBalance && tokenBalance[0] && tokenBalance[0][0]) {
        await sendBurnTransaction(tokenBalance[0][0]);
        await removePastNFTAssets();
      }
      await sendMintTransaction(
        account,
        `https://gateway.pinata.cloud/ipfs/${metadataHash}`
      );
      setIsMintingNft(false);
      toast.success(
        <p>
          Wrapped Generated, check it out by clicking{" "}
          <a href={`https://testnets.opensea.io/${account}`}>HERE</a>
        </p>,
        { duration: 10000 }
      );
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (account) {
      toast.success("Wallet Connected");
    }
  }, [account]);

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center h-screen w-screen bg-zinc-950 text-white py-20">
        <h1 className="text-4xl mb-10">Spotify Wrapped NFT Minter</h1>
        <p className="mt-10 max-w-3xl mb-20">
          Connect your wallet below to mint your own Spotify Wrapped Soulbound
          NFT. Flex your favourite artists and songs with this on-demand Spotify
          Wrapped generator. Be careful though, if you mint a second NFT the
          previous one will be burned.
        </p>

        {account ? (
          <button
            className={`mb-10 rounded-full px-4 py-2  hover:text-zinc-950 transition-all ${
              isMintingNft ? "border-none" : "border-2 hover:bg-white"
            }`}
            onClick={mintNft}
          >
            {isMintingNft ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-white "
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              "Mint"
            )}
          </button>
        ) : (
          <button
            className="border-2 rounded-full px-4 py-2 hover:bg-white hover:text-zinc-950 transition-all"
            onClick={() => activateBrowserWallet()}
          >
            Connect Wallet
          </button>
        )}
        {generatedImageBlob ? (
          <img
            className="max-w-64"
            src={URL.createObjectURL(generatedImageBlob)}
            alt="Generated Spotify Wrapped NFT"
          />
        ) : null}
      </div>
    </>
  );
}
export default Minter;
