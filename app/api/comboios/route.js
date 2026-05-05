import data from "@/data/comboios.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(data);
}