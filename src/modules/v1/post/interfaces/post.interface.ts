// Post data transfer objects and service interface
export interface CreatePostRequest {
    title: string;
    content?: string;
    authorId: string; // This will be the userId
}

export interface UpdatePostRequest {
    title?: string;
    content?: string;
}

export interface PostResponse {
    id: string;
    title: string;
    content?: string;
    authorId: string;
    createdAt: Date;
    author?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }; // Include author details when needed
}

export interface IPostService {
    createPost(postData: CreatePostRequest): Promise<PostResponse>;
    getPostById(id: string): Promise<PostResponse | null>;
    getPostsByAuthor(authorId: string): Promise<PostResponse[]>;
    updatePost(id: string, postData: UpdatePostRequest): Promise<PostResponse | null>;
    deletePost(id: string): Promise<boolean>;
    getAllPosts(
        page: number,
        limit: number
    ): Promise<{
        posts: PostResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
