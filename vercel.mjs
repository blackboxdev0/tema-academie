const candidatePreview = process.env.VERCEL_ENV === 'preview' &&
  process.env.VERCEL_GIT_COMMIT_REF === 'feat/production-candidate-20261118';

export const config = candidatePreview ? {
  buildCommand: 'node app/scripts/build-vercel-preview.cjs',
  outputDirectory: 'app/dist/web',
} : {};
