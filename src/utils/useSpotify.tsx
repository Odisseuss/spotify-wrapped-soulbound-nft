import {
  AuthorizationCodeWithPKCEStrategy,
  SdkOptions,
  SpotifyApi,
} from "@spotify/web-api-ts-sdk";
import { useEffect, useState } from "react";

export function useSpotify(init = true, config?: SdkOptions) {
  const [sdk, setSdk] = useState<SpotifyApi | null>(null);

  useEffect(() => {
    (async () => {
      const auth = new AuthorizationCodeWithPKCEStrategy(
        `${process.env.REACT_APP_SPOTIFY_CLIENT_ID}`,
        `${process.env.REACT_APP_SPOTIFY_REDIRECT_URI}`,
        ["user-top-read"]
      );
      const internalSdk = new SpotifyApi(auth, config);

      try {
        if (init) {
          const { authenticated } = await internalSdk.authenticate();

          if (authenticated) {
            setSdk(() => internalSdk);
          }
        }
      } catch (e: Error | unknown) {
        const error = e as Error;
        if (
          error &&
          error.message &&
          error.message.includes("No verifier found in cache")
        ) {
          console.error(
            "If you are seeing this error in a React Development Environment it's because React calls useEffect twice. Using the Spotify SDK performs a token exchange that is only valid once, so React re-rendering this component will result in a second, failed authentication. This will not impact your production applications (or anything running outside of Strict Mode - which is designed for debugging components).",
            error
          );
        } else {
          console.error(e);
        }
      }
    })();
  }, [config, init]);

  return sdk;
}
