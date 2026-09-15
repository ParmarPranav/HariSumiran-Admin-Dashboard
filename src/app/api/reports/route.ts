import { GET as generateGET } from "./generate/route";

export async function GET(req: Request) {
  return generateGET(req);
}
