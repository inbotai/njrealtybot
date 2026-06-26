import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/news/${slug}`);
}
