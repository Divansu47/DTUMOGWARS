import { redirect } from 'next/navigation'

export default function ShortProfileRedirect({ params }: { params: { id: string } }) {
  redirect(`/profile/${params.id}`)
}
