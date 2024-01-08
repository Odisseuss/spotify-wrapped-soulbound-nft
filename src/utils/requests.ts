import axios from "axios";

export const unpinFromIpfs = async (cid: string) => {
  return axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
    headers: {
      "Content-Type": `application/json`,
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_KEY}`,
    },
  });
};

export const pinFileToIPFS = async (data: FormData) => {
  const pinFileResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      headers: {
        "Content-Type": `multipart/form-data;`,
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_KEY}`,
      },
    }
  );
  return pinFileResponse.data;
};

export const pinJsonToIPFS = async (data: string) => {
  const pinFileResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    data,
    {
      headers: {
        "Content-Type": `application/json`,
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_KEY}`,
      },
    }
  );
  return pinFileResponse.data;
};
