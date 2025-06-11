/**
 * ARCXP API Service
 *
 * This service provides methods to interact with the ARCXP Content API
 * Documentation: https://dev.arcxp.com/api/public-content-retrieval/content-api/
 * API Spec: https://alc-swagger-template.s3.amazonaws.com/docs/swagger/arc-products/content-api.json
 */

// Types for API responses
export interface ArcAuthor {
  _id: string;
  name: string;
  image?: {
    url?: string;
  };
  description?: string;
  slug?: string;
}

export interface ArcContent {
  _id: string;
  type?: string;
  headlines?: {
    basic?: string;
  };
  description?: {
    basic?: string;
  } | string;
  promo_items?: {
    basic?: {
      url?: string;
      type?: string;
    };
  };
  taxonomy?: {
    primary_section?: {
      name?: string;
    };
  };
  website_url?: string;
  canonical_url?: string;
  name?: string;
  content_alias?: string;
  credits?: {
    by?: ArcAuthor[];
  };
}

export interface ArcCollection {
  _id: string;
  name?: string;
  content_alias?: string;
  description?: string | {
    basic?: string;
  };
}

export interface ArcCollectionsResponse {
  count: number;
  content_elements: ArcContent[];
}

export interface ArcRequestOptions {
  website?: string;
  content_alias?: string;
  _id?: string;
  published?: boolean;
  size?: number;
  [key: string]: any; // Allow additional query params
}

/**
 * Builds the base URL for ARCXP API based on environment variables
 */
export const getBaseUrl = (): string => {
  const { env: runtimeEnv } = Astro.locals.runtime;

  const org = import.meta.env.ARC_ORG ?? runtimeEnv.ARC_ORG;
  const env = import.meta.env.ARC_ENV ?? runtimeEnv.ARC_ENV;

  // If env is production, omit the env part
  if (env === 'production') {
    return `https://api.${org}.arcpublishing.com`;
  }

  return `https://api.${env}.${org}.arcpublishing.com`;
};

/**
 * Creates a fetch function with the proper authorization headers for ARCXP API
 * This can be reused for different ARCXP API endpoints
 */
export const createArcFetch = () => {
  const { env: runtimeEnv } = Astro.locals.runtime;

  const token = import.meta.env.ARC_DEVCENTER_TOKEN ?? runtimeEnv.ARC_DEVCENTER_TOKEN;

  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  };
};

/**
 * Convert object to URL query parameters
 */
export const objectToQueryParams = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        params.append(key, value.toString());
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// Create the fetch function with auth headers
const arcFetch = createArcFetch();

/**
 * Fetches collections from the ARCXP API
 * @param options - Query parameters for the collections API
 */
export const getCollections = async (options: ArcRequestOptions = {}): Promise<ArcCollectionsResponse> => {
  const baseUrl = getBaseUrl();
  const queryParams = objectToQueryParams(options);
  const url = `${baseUrl}/content/v4/collections${queryParams}`;

  try {
    console.log(`Fetching collections from ${url}`);
    const response = await arcFetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

/**
 * Fetches a single collection by ID or content_alias
 * @param idOrAlias - The collection ID or content_alias
 * @param options - Additional query parameters
 */
export const getCollection = async (idOrAlias: string, options: ArcRequestOptions = {}): Promise<ArcCollectionsResponse> => {
  // Determine if we're fetching by ID or content_alias
  const fetchOptions: ArcRequestOptions = { ...options };

  if (idOrAlias.includes('/')) {
    // If it contains a slash, it's likely a path/ID
    fetchOptions._id = idOrAlias;
  } else {
    // Otherwise, treat it as a content_alias
    fetchOptions.content_alias = idOrAlias;
  }

  // Ensure website is set
  if (!fetchOptions.website) {
    fetchOptions.website = 'thedailybeast';
  }

  try {
    const response = await getCollections(fetchOptions);

    if (response.count === 0 || !response.content_elements || response.content_elements.length === 0) {
      throw new Error(`No collection found for: ${idOrAlias}`);
    }

    return response;
  } catch (error) {
    console.error(`Error fetching collection ${idOrAlias}:`, error);
    throw error;
  }
};

/**
 * Maps ArcContent items to a format suitable for the application
 * @param items - Array of ArcContent items
 */
export const mapArticles = (items: ArcContent[]) => {
  return items.map(item => {
    // Extract description text handling both string and object formats
    let excerpt = '';
    if (typeof item.description === 'string') {
      excerpt = item.description;
    } else if (item.description?.basic) {
      excerpt = item.description.basic;
    }

    // Extract author information
    const author = item.credits?.by?.[0] ? {
      name: item.credits.by[0].name,
      avatar: item.credits.by[0].image?.url || '',
      slug: item.credits.by[0].slug || ''
    } : undefined;

    return {
      id: item._id,
      title: item.headlines?.basic || item.name || 'Untitled',
      excerpt: excerpt,
      imageUrl: item.promo_items?.basic?.url || 'https://via.placeholder.com/800x450',
      category: item.taxonomy?.primary_section?.name || 'Uncategorized',
      url: item.website_url || item.canonical_url || '#',
      author: author
    };
  });
};

// Convenience function to fetch homepage collection
export const getHomepageCollection = async (size = 20) => {
  return getCollection('homepage', {
    website: 'thedailybeast',
    published: true,
    size
  });
};

// Export a higher-level function for components to use
export const getHomepageArticles = async (size = 20) => {
  try {
    const response = await getHomepageCollection(size);
    if (response.content_elements && response.content_elements.length > 0) {
      // Direct mapping of content_elements since they are now ArcContent type
      return mapArticles(response.content_elements);
    }
    throw new Error('No content elements found in homepage collection');
  } catch (error) {
    console.error('Error fetching homepage articles:', error);
    // Return fallback data or rethrow
    throw error;
  }
};
