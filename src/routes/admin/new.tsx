import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '~/components/editor/PostForm'

export const Route = createFileRoute('/admin/new')({
  component: NewPost,
})

function NewPost() {
  return <PostForm />
}
