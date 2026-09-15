import { POST as thalPOST } from "../route";

export async function POST(req: Request) {
  return thalPOST(req);
}
