import type { Post } from '../../drizzle/schema'
import { PostCard } from './PostCard'

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-neutral-500">아직 글이 없습니다.</p>
    )
  }
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
