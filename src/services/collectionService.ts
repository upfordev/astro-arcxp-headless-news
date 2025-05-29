/**
 * Collection Service
 *
 * This service provides methods to fetch and process collections from the ARCXP API
 * for use in the news site components, with fallback data in case API calls fail.
 */

import { getCollection, mapArticles, type ArcRequestOptions } from './arcxp';

// Define collection aliases for different sections of the site
export const COLLECTION_ALIASES = {
  MAIN_ARTICLES: 'homepage',
  LATEST_NEWS: 'scouted',
  BRIEFING: 'editors-best',
  CHEAT_SHEET: 'cheatsheet'
};

/**
 * Fetches articles for the main article grid
 * @param size Number of articles to fetch (default: 7)
 */
export const getMainArticles = async (size = 7) => {
  try {
    const options: ArcRequestOptions = {
      website: 'thedailybeast',
      content_alias: COLLECTION_ALIASES.MAIN_ARTICLES,
      published: true,
      size
    };

    const response = await getCollection(COLLECTION_ALIASES.MAIN_ARTICLES, options);
    // console.log(response);

    if (response.content_elements && response.content_elements.length > 0) {
      return mapArticles(response.content_elements);
    }
    throw new Error('No content elements found in main articles collection');
  } catch (error) {
    console.error('Error fetching main articles:', error);
    return [];
  }
};

/**
 * Fetches articles for the latest news section
 * @param size Number of articles to fetch (default: 7)
 */
export const getLatestArticles = async (size = 7) => {
  try {
    const options: ArcRequestOptions = {
      website: 'thedailybeast',
      content_alias: COLLECTION_ALIASES.LATEST_NEWS,
      published: true,
      size
    };

    const response = await getCollection(COLLECTION_ALIASES.LATEST_NEWS, options);

    if (response.content_elements && response.content_elements.length > 0) {
      return mapArticles(response.content_elements);
    }
    throw new Error('No content elements found in latest news collection');
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
};

/**
 * Fetches articles for the briefing section
 * @param size Number of articles to fetch (default: 5)
 */
export const getBriefingArticles = async (size = 5) => {
  try {
    const options: ArcRequestOptions = {
      website: 'thedailybeast',
      content_alias: COLLECTION_ALIASES.BRIEFING,
      published: true,
      size
    };

    const response = await getCollection(COLLECTION_ALIASES.BRIEFING, options);

    if (response.content_elements && response.content_elements.length > 0) {
      return mapArticles(response.content_elements);
    }
    throw new Error('No content elements found in briefing collection');
  } catch (error) {
    console.error('Error fetching briefing articles:', error);
    return [];
  }
};

/**
 * Fetches articles for the cheat sheet sidebar
 * @param size Number of articles to fetch (default: 5)
 */
export const getCheatSheetArticles = async (size = 5) => {
  try {
    const options: ArcRequestOptions = {
      website: 'thedailybeast',
      content_alias: COLLECTION_ALIASES.CHEAT_SHEET,
      published: true,
      size
    };

    const response = await getCollection(COLLECTION_ALIASES.CHEAT_SHEET, options);

    if (response.content_elements && response.content_elements.length > 0) {
      return mapArticles(response.content_elements);
    }
    throw new Error('No content elements found in cheat sheet collection');
  } catch (error) {
    console.error('Error fetching cheat sheet articles:', error);
    return [];
  }
};
