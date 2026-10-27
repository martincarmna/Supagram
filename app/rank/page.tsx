"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { supabase } from "../lib/supabase";
import { HeartIcon } from "../components/HeartIcon";
import Modal from "../components/Modal";
import { Post } from "../types";

// Pon 5 cuando ya veas las fotos
const MIN_LIKES = 0;

export default function RankPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, image_url, caption, user_id, created_at");

      console.log("POSTS:", postsData, postsError);

      if (postsError || !postsData) return;

      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const postIds = postsData.map((p) => p.id);

      const [profilesRes, likesRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", userIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
      ]);

      console.log("PROFILES:", profilesRes.data, profilesRes.error);
      console.log("LIKES:", likesRes.data?.length, likesRes.error);

      const profilesMap = new Map(
        (profilesRes.data ?? []).map((p: any) => [
          p.id,
          {
            username: p.username ?? p.full_name ?? p.name ?? null,
            avatar_url: p.avatar_url ?? p.avatar ?? null,
          },
        ])
      );

      const likesCountMap = new Map<string | number, number>();
      likesRes.data?.forEach((like) => {
        likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) ?? 0) + 1);
      });

      const ranked = postsData
        .map((post) => ({
          ...post,
          profile: profilesMap.get(post.user_id),
          likes_count: likesCountMap.get(post.id) ?? 0,
        }))
        .filter((p) => p.likes_count >= MIN_LIKES)
        .sort((a, b) => b.likes_count - a.likes_count);

      setPosts(ranked as Post[]);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card-bg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Ranking
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-2">
        {posts.length === 0 && (
          <p className="text-center text-foreground/60 py-10">
            No hay posts para mostrar (revisa la consola).
          </p>
        )}
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square overflow-hidden group"
            >
              <Image
                src={post.image_url}
                alt={`Post con ${post.likes_count} likes`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <HeartIcon size="sm" />
                <span className="text-white font-semibold">
                  {post.likes_count.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {selectedPost && (
        <Modal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}