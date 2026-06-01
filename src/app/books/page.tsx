import { BooksExplorer } from "@/features/catalog/components/BooksExplorer";

type BooksPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;

  return <BooksExplorer initialQuery={query ?? ""} />;
}
