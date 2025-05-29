/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ARC_ORG: string;
  readonly ARC_ENV: string;
  readonly ARC_DEVCENTER_TOKEN: string;
  readonly TEST_STORY_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
