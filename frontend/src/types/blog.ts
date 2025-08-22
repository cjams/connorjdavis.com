export interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  reading_time: number;
  tags: string[];
  content?: string;
  components?: Component[];
  toc?: string;
  footnotes?: Record<string, FootnoteInfo>;
}

export interface Component {
  name: string;
  props: Record<string, any>;
  children?: string;
}

export interface FootnoteInfo {
  number: number;
  original_number: string;
}

export interface Footnote {
  id: string;
  number: number;
  content: string;
  backref: string;
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
