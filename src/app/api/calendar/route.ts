import { GET as unifiedGET } from "./unified/route";

export async function GET(req: Request) {
  return unifiedGET(req);
}
