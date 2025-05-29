/**
 * Article Service
 *
 * This service provides methods to fetch and process articles from the ARCXP API
 */

import { getBaseUrl, createArcFetch, objectToQueryParams } from './arcxp';

// Define interfaces for article data
export interface ArcArticle {
  _id: string;
  canonical_url?: string;
  website_url?: string;
  headlines?: {
    basic?: string;
    meta_title?: string;
    web?: string;
  };
  subheadlines?: {
    basic?: string;
  };
  description?: {
    basic?: string;
  };
  content_elements?: ArcContentElement[];
  promo_items?: {
    basic?: {
      url?: string;
      type?: string;
      caption?: string;
    };
  };
  taxonomy?: {
    primary_section?: {
      name?: string;
    };
  };
  credits?: {
    by?: {
      _id: string;
      name: string;
      image?: {
        url?: string;
      };
      description?: string;
      slug?: string;
    }[];
  };
  display_date?: string;
  publish_date?: string;
  first_publish_date?: string;
  label?: {
    rubric?: {
      text?: string;
      display?: boolean;
    };
  };
}

export interface ArcContentElement {
  _id: string;
  type: string;
  content?: string;
  subtype?: string;
  embed?: {
    config?: {
      caption?: string;
      videoCode?: string;
    };
    id?: string;
    url?: string;
  };
  additional_properties?: any;

  // Header properties
  level?: number;

  // List properties
  items?: string[];
  list_type?: 'ordered' | 'unordered';

  // Link properties
  url?: string;

  // Table properties
  rows?: string[][];
  header?: boolean;

  // Quote properties
  citation?: {
    content?: string;
    type?: string;
  };

  // Social embed properties
  raw_oembed?: {
    html?: string;
    type?: string;
  };
  html?: string;
  source_type?: string;

  // Code properties
  language?: string;

  // Correction properties
  text?: string;
  correction_type?: string;

  // Gallery properties
  content_elements?: any[];
  headlines?: {
    basic?: string;
  };
  title?: string;
}

/**
 * Fetches an article by its website URL
 * @param websiteUrl - The website URL of the article (e.g., "/article-slug/")
 */
export const getArticleByUrl = async (websiteUrl: string): Promise<ArcArticle | null> => {
  const baseUrl = getBaseUrl();
  const arcFetch = createArcFetch();

  const options = {
    website: 'thedailybeast',
    website_url: websiteUrl,
    published: true
  };

  const queryParams = objectToQueryParams(options);
  const url = `${baseUrl}/content/v4/stories${queryParams}`;

  try {
    console.log(`Fetching article from ${url}`);
    const response = await arcFetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as ArcArticle;

    if (data) {
      // console.log(data)
      return data;
    }

    throw new Error(`No article found for URL: ${websiteUrl}`);
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};
