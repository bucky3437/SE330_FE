export type Author = {
  authorId?: number;
  id?: number;
  name: string;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthorSearchParams = {
  q?: string;
  name?: string;
};

export type Category = {
  categoryId?: number;
  id?: number;
  name: string;
  description?: string | null;
};

export type Book = {
  bookId?: number;
  id?: number;
  title: string;
  isbn: string;
  imageUrl?: string | null;
  coverImage?: {
    originalUrl?: string | null;
    thumbnailUrl?: string | null;
    detailUrl?: string | null;
    altText?: string | null;
  } | null;
  authors?: Author[] | string[];
  category?: Category | string | null;
  categoryId?: number | null;
  publishedDate?: string | null;
  language?: string | null;
  edition?: string | null;
  totalCopies?: number;
  availableCopies?: number;
};

export type BookCopy = {
  copyId?: number;
  id?: number;
  bookId?: number;
  barcode: string;
  status?: string;
  condition?: string | null;
  location?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BookCopySearchParams = {
  status?: string;
  barcode?: string;
  condition?: string;
  location?: string;
};

export type BookSearchParams = {
  q?: string;
  title?: string;
  isbn?: string;
  authorId?: string;
  author?: string;
  categoryId?: string;
  availableOnly?: string;
  language?: string;
  page?: string;
  size?: string;
  sort?: string;
};

export type BookPayload = {
  title: string;
  isbn: string;
  publishedDate?: string;
  language?: string;
  edition?: string;
  categoryId?: number | null;
  authorIds?: number[];
};

export type UpdateBookPayload = Omit<BookPayload, "authorIds" | "isbn">;

export type CopyPayload = {
  barcode: string;
  condition?: string;
  location?: string;
};

export type BulkCopyPayload = {
  quantity?: number;
  barcodes?: string[];
  condition?: string;
  location?: string;
};

export type ImportCsvResult = {
  jobId?: string;
  id?: string;
  filename?: string;
  status?: string;
  processedRows?: number;
  totalRows?: number;
  successRows?: number;
  failedRows?: number;
  createdBooks?: number;
  createdCopies?: number;
  errors?: Array<{
    rowNumber?: number;
    isbn?: string;
    barcode?: string;
    code?: string;
    message?: string;
  }>;
};

export type PageResult<T> = {
  items: T[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};
