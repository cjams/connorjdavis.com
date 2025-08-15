import type { Post, Category, Tag, PostListResponse } from "../types/blog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
  private async fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPosts(
    page: number = 1,
    perPage: number = 10
  ): Promise<PostListResponse> {
    return this.fetchJson<PostListResponse>(
      `/posts?page=${page}&per_page=${perPage}`
    );
  }

  async getPost(slug: string): Promise<Post> {
    return this.fetchJson<Post>(`/posts/${slug}`);
  }

  async getCategories(): Promise<Category[]> {
    return this.fetchJson<Category[]>("/categories");
  }

  async getTags(): Promise<Tag[]> {
    return this.fetchJson<Tag[]>("/tags");
  }

  async getRecentPosts(limit: number = 5): Promise<Post[]> {
    const response = await this.getPosts(1, limit);
    return response.posts;
  }
}

export const apiService = new ApiService();
export default apiService;
