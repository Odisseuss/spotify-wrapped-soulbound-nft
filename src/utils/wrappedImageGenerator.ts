import { Image as SpotifyImage } from "@spotify/web-api-ts-sdk";
import { v4 as uuidv4 } from "uuid";
import { pinFileToIPFS, pinJsonToIPFS } from "./requests";
import toast from "react-hot-toast";

const uploadMetadataToIpfs = async (
  id: string,
  ipfsHash: string | null
): Promise<string | null> => {
  const data = JSON.stringify({
    pinataContent: {
      name: `Soulbound Spotify Wrapped`,
      description: ``,
      image: `ipfs://${ipfsHash}`,
    },
    pinataMetadata: {
      name: `${id}.json`,
    },
  });

  try {
    return (await pinJsonToIPFS(data)).IpfsHash;
  } catch (error) {
    return null;
  }
};

const uploadImageToIpfs = async (
  id: string,
  blob: Blob
): Promise<string | null> => {
  const formData = new FormData();

  formData.append("file", blob);

  const metadata = JSON.stringify({
    name: `${id}.jpg`,
  });
  formData.append("pinataMetadata", metadata);

  try {
    return (await pinFileToIPFS(formData)).IpfsHash;
  } catch (error) {
    return null;
  }
};

const loadImage = (
  src: string,
  crossOrigin: "anonymous" | "" = ""
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

const loadCustomFonts = async () => {
  const customFonts = [
    new FontFace("CircularBook", "url(CircularBook.otf)"),
    new FontFace("CircularMedium", "url(CircularMedium.otf)"),
    new FontFace("CircularBold", "url(CircularBold.otf)"),
  ];
  await Promise.all(
    customFonts.map((font) =>
      font.load().then((font_1) => document.fonts.add(font_1))
    )
  );
};

const truncateText = (text: string) => {
  return text.length > 13 ? text.substring(0, 13).trim() + "..." : text;
};

const renderTopArtists = (
  topArtistData: {
    image: SpotifyImage | undefined;
    topArtists: string[] | undefined;
    genre: any;
  },
  canvasContext: CanvasRenderingContext2D
) => {
  canvasContext.fillStyle = "#fff";
  canvasContext.font = "48px CircularMedium";
  canvasContext.fillText("Top Artists", 75, 1116);
  canvasContext.font = "48px CircularBold";
  topArtistData.topArtists?.forEach((artist, index) => {
    canvasContext.fillText(
      `${index + 1}  ${truncateText(artist)}`,
      75,
      1116 + 66 * (index + 1)
    );
  });
};

const renderTopSongs = (
  topSongsData: string[] | undefined,
  canvasContext: CanvasRenderingContext2D
) => {
  canvasContext.fillStyle = "#fff";
  canvasContext.font = "48px CircularMedium";
  canvasContext.fillText("Top Songs", 570, 1116);
  canvasContext.font = "48px CircularBold";
  topSongsData?.forEach((song, index) => {
    canvasContext.fillText(
      `${index + 1}  ${truncateText(song)}`,
      570,
      1116 + 66 * (index + 1)
    );
  });
};
const renderTopGenre = (
  genre: string,
  canvasContext: CanvasRenderingContext2D
) => {
  canvasContext.fillStyle = "#fff";
  canvasContext.font = "48px CircularMedium";
  canvasContext.fillText("Top Genre", 75, 1560);
  canvasContext.font = "82px CircularBold";
  canvasContext.fillText(
    genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase(),
    75,
    1660
  );
};
const renderCardFooter = (canvasContext: CanvasRenderingContext2D) => {
  canvasContext.fillStyle = "#fff";
  canvasContext.font = "38px CircularBold";
  canvasContext.fillText("SOULBOUND WRAPPED", 570, 1846);
};
const renderCardHeader = (
  artistImage: HTMLImageElement,
  canvasContext: CanvasRenderingContext2D
) => {
  canvasContext.drawImage(artistImage, 246, 208, 590, 590);
};
const renderCardBackground = (
  templateImage: HTMLImageElement,
  canvas: HTMLCanvasElement,
  canvasContext: CanvasRenderingContext2D
) => {
  canvasContext.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
};

export const createWrappedAndUploadToIpfs = async (
  topArtistData: {
    image: SpotifyImage | undefined;
    topArtists: string[] | undefined;
    genre: any;
  },
  topSongsData: string[] | undefined
) => {
  return new Promise<Blob>(async (resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    Promise.all([
      loadImage("/template-with-bg.png"),
      loadImage(topArtistData.image?.url || "", "anonymous"),
    ])
      .then(async ([templateImage, artistImage]) => {
        await loadCustomFonts();
        renderCardBackground(templateImage, canvas, ctx);
        renderCardHeader(artistImage, ctx);
        renderCardFooter(ctx);
        renderTopArtists(topArtistData, ctx);
        renderTopSongs(topSongsData, ctx);
        renderTopGenre(topArtistData.genre, ctx);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        }, "image/png");
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const uploadNftToIpfs = async (blob: Blob) => {
  if (blob) {
    try {
      const itemId = uuidv4();

      const nftHash = await uploadImageToIpfs(itemId, blob);
      const metadataHash = await uploadMetadataToIpfs(itemId, nftHash);
      return metadataHash;
    } catch (error) {
      toast.error("Something went wrong");
    }
  } else {
    toast.error("Something went wrong");
  }
};
