import data from "@/data/comboios.json";

export async function GET() {
  return Response.json(data);
}