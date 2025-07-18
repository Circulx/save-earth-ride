// lib/blogSheetHelpers.ts
import { getSheetsClient, SPREADSHEET_ID } from './googlesheet';

const BLOG_SHEET_NAME = 'blog';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  blogURL: string;
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  tags: string[];
  image: string;
  readTime: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export async function readBlogFromSheet(): Promise<BlogPost[]> {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${BLOG_SHEET_NAME}!A2:Q`,
  });

  const rows = response.data.values || [];

  return rows.map((row, index) => ({
    id: Number(row[0]) || index + 1,
    title: row[1] || '',
    excerpt: row[2] || '',
    content: row[3] || '',
    blogURL: row[4] || '',
    authorName: row[5] || '',
    authorBio: row[6] || '',
    authorAvatar: row[7] || '',
    tags: row[8] ? row[8].split(',').map((tag: string) => tag.trim()) : [],
    image: row[9] || '',
    readTime: row[10] || '',
    featured: row[11] === 'true',
    status: (row[12] || 'draft') as 'draft' | 'published' | 'archived',
    category: row[13] || '',
    date: row[14] || new Date().toISOString().split('T')[0],
    createdAt: row[15] || new Date().toISOString(),
    updatedAt: row[16] || new Date().toISOString(),
  }));
}

export async function writeBlogToSheet(blogs: BlogPost[]): Promise<{ success: boolean; updated: number; added: number }> {
  const sheets = await getSheetsClient();

  // Read existing data
  const existingBlogs = await readBlogFromSheet();
  
  // Create a set of existing IDs for quick lookup
  const existingIds = new Set(existingBlogs.map(blog => blog.id.toString()));
  
  // Create a map of existing blogs by ID for updates
  const existingBlogMap = new Map(
    existingBlogs.map((blog, index) => [blog.id.toString(), { blog, rowIndex: index + 2 }])
  );

  // Separate new blogs from updates
  const newBlogs: BlogPost[] = [];
  const updatedBlogs: { blog: BlogPost; rowIndex: number }[] = [];

  blogs.forEach((blog) => {
    const blogId = blog.id.toString();
    
    if (existingIds.has(blogId)) {
      // This blog exists, check if it needs updating
      const existingData = existingBlogMap.get(blogId);
      if (existingData && hasBlogChanged(existingData.blog, blog)) {
        updatedBlogs.push({ blog: { ...blog, updatedAt: new Date().toISOString() }, rowIndex: existingData.rowIndex });
      }
    } else {
      // This is a new blog
      newBlogs.push({ 
        ...blog, 
        createdAt: blog.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  console.log(`Found ${newBlogs.length} new blogs and ${updatedBlogs.length} blogs to update`);

  // Update existing rows that have changed
  for (const { blog, rowIndex } of updatedBlogs) {
    const values = [
      blog.id,
      blog.title,
      blog.excerpt,
      blog.content,
      blog.blogURL,
      blog.authorName,
      blog.authorBio,
      blog.authorAvatar,
      Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags,
      blog.image,
      blog.readTime,
      blog.featured ? 'true' : 'false',
      blog.status,
      blog.category,
      blog.date,
      blog.createdAt,
      blog.updatedAt,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BLOG_SHEET_NAME}!A${rowIndex}:Q${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });
  }

  // Append only new rows
  if (newBlogs.length > 0) {
    const newRows = newBlogs.map(blog => [
      blog.id,
      blog.title,
      blog.excerpt,
      blog.content,
      blog.blogURL,
      blog.authorName,
      blog.authorBio,
      blog.authorAvatar,
      Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags,
      blog.image,
      blog.readTime,
      blog.featured ? 'true' : 'false',
      blog.status,
      blog.category,
      blog.date,
      blog.createdAt,
      blog.updatedAt,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BLOG_SHEET_NAME}!A2:Q`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: newRows,
      },
    });
  }

  return { 
    success: true, 
    updated: updatedBlogs.length, 
    added: newBlogs.length 
  };
}

// Helper function to check if blog data has changed
function hasBlogChanged(existing: BlogPost, incoming: BlogPost): boolean {
  const fieldsToCompare = [
    'title', 'excerpt', 'content', 'blogURL', 'authorName', 'authorBio', 
    'authorAvatar', 'image', 'readTime', 'featured', 'status', 'category', 'date'
  ];
  
  return fieldsToCompare.some(field => {
    if (field === 'tags') {
      const existingTags = Array.isArray(existing.tags) ? existing.tags.join(', ') : existing.tags;
      const incomingTags = Array.isArray(incoming.tags) ? incoming.tags.join(', ') : incoming.tags;
      return existingTags !== incomingTags;
    }
    
    const existingValue = existing[field as keyof BlogPost] || '';
    const incomingValue = incoming[field as keyof BlogPost] || '';
    return existingValue !== incomingValue;
  });
}

// Function to delete a blog post
export async function deleteBlogFromSheet(blogId: number): Promise<{ success: boolean }> {
  const sheets = await getSheetsClient();

  // Read existing data to find the row to delete
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${BLOG_SHEET_NAME}!A2:Q`,
  });

  const existingRows = response.data.values || [];
  
  // Find the row index for the blog to delete
  let rowToDelete = -1;
  existingRows.forEach((row, index) => {
    if (Number(row[0]) === blogId) {
      rowToDelete = index + 2; // +2 because A2 is row 2
    }
  });

  if (rowToDelete === -1) {
    throw new Error('Blog not found');
  }

  // Delete the row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming the first sheet
              dimension: 'ROWS',
              startIndex: rowToDelete - 1,
              endIndex: rowToDelete,
            },
          },
        },
      ],
    },
  });

  return { success: true };
}

// Function to add a single blog post (with duplicate check)
export async function addSingleBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: number; message?: string }> {
  const existingBlogs = await readBlogFromSheet();
  
  // Generate new ID
  const newId = existingBlogs.length > 0 ? Math.max(...existingBlogs.map(b => b.id)) + 1 : 1;
  
  // Check if a blog with similar title already exists
  const existingBlog = existingBlogs.find(b => 
    b.title.toLowerCase() === blog.title.toLowerCase()
  );
  
  if (existingBlog) {
    return { success: false, message: 'A blog with this title already exists' };
  }
  
  const newBlog: BlogPost = {
    ...blog,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await writeBlogToSheet([newBlog]);
  
  return { success: true, id: newId };
}