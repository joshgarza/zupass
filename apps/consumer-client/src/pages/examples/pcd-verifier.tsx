import {
  getWithoutProvingUrl,
  useZupassPopupMessages
} from "@pcd/passport-interface";
import { useEffect, useMemo, useState } from "react";
import { CollapsableCode, HomeLink } from "../../components/Core";
import { ExampleContainer } from "../../components/ExamplePage";
import { ZUPASS_URL } from "../../constants";
import { sendZupassRequest } from "../../util";

export default function Page(): JSX.Element {
  const [zupassPCDStr] = useZupassPopupMessages();
  const [pcdList, setPCDList] = useState([]);
  const [pcd, setPCD] = useState("");

  useEffect(() => {
    if (localStorage.getItem("pcdList")) {
      setPCDList(JSON.parse(localStorage.getItem("pcdList")));
    }
  }, []);

  // sets pcd list on first load
  // parses and adds pcd if it doesn't exist
  useMemo(() => {
    try {
      // Parsing logic for a fetched PCD from zupassPopup
      const parsed = JSON.parse(zupassPCDStr);

      //Logic for parsing eddsa-ticket-pcd type
      if (parsed.type === "eddsa-ticket-pcd") {
        if (parsed.pcd && typeof parsed.pcd === "string") {
          // Attempt to parse the 'pcd' property to JSON
          try {
            parsed.pcd = JSON.parse(parsed.pcd);
            // Further check for nested 'eddsaPCD.pcd' property to format
            if (
              parsed.pcd.eddsaPCD &&
              typeof parsed.pcd.eddsaPCD.pcd === "string"
            ) {
              parsed.pcd.eddsaPCD.pcd = JSON.parse(parsed.pcd.eddsaPCD.pcd);
            }
          } catch (e) {
            console.error("Error parsing nested PCD:", e);
          }
        }
      }

      setPCD(parsed);

      // loop through pcdList
      let exists = false;

      for (let i = 0; i < pcdList.length; i++) {
        if (pcdList[i].pcd.id === parsed.pcd.id) {
          console.log("pcd exists", pcdList[i]);
          exists = true;
        }
      }

      if (!exists) {
        console.log("doesn't exist");
        setPCDList((prevList) => [...prevList, parsed]);
        localStorage.setItem("pcdList", JSON.stringify([...pcdList, parsed]));
      }
    } catch (e) {
      console.error("Error formatting PCD string:", e);
      return null;
    }
  }, [zupassPCDStr]);

  return (
    <>
      <HomeLink />
      <h2>Upload and verify PCDs</h2>
      <p>
        This page shows a working example of how to upload and verify a PCD
        without proving it first.
      </p>
      <div>
        <ul>
          {pcdList.map((pcd, index) => (
            <li key={index}>PCD at index: {JSON.stringify(pcd?.pcd?.id)}</li>
          ))}
        </ul>
      </div>
      <ExampleContainer>
        <button onClick={getProofWithoutProving}>
          get pcd without proving
        </button>
        {pcd && <CollapsableCode code={JSON.stringify(pcd, null, 2)} />}
      </ExampleContainer>
    </>
  );
}

function getProofWithoutProving(): void {
  const url = getWithoutProvingUrl(
    ZUPASS_URL,
    window.location.origin + "#/popup",
    "eddsa-ticket-pcd"
  );
  sendZupassRequest(url);
}

// Todo:
// - build a display for pcds
