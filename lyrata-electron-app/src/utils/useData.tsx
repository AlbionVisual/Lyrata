import { useEffect, useState } from "react";

export type DatabaseDocument = [number, string, string, string, string, number];

interface DatabaseTextPartDescription {
  id: number;
  positions: [number, number];
}

export interface DatabaseText {
  text: string;
  parts: DatabaseTextPartDescription[];
}
export interface DocumentProperties {
  documentId: number;
  isAnalising: boolean;
}

export type DatabaseTextBlock = [
  number,
  number,
  number,
  number,
  string,
  any,
  any,
  string
];

const default_parser = (d: any) => d;

export default function useData<state_type = DatabaseDocument[]>(
  url: string,
  json_parser: (data: any) => state_type = default_parser
): state_type | undefined {
  const [data, setData] = useState<state_type>();
  useEffect(() => {
    let ignore = false;
    fetch("http://localhost:5000/api/" + url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (!ignore) {
          json = json_parser(json);
          setData(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url, json_parser]);
  return data;
}
