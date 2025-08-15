export interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  reading_time: number;
  categories: string[];
  tags: string[];
  content?: string;
  components?: Component[];
}

export interface Component {
  name: string;
  props: Record<string, any>;
  children?: string;
}

export interface Category {
  name: string;
  slug: string;
  count?: number;
}

export interface Tag {
  name: string;
  slug: string;
  count?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
