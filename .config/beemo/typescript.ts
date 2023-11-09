import type TypeScript from '@niieani/scaffold/src/configs/typescript'

export default {
  compilerOptions: {
    lib: ['esnext', 'es2022'],
    module: 'nodenext',
    moduleResolution: 'nodenext',
    // TODO: importHelpers: true,
    // TODO: verbatimModuleSyntax: true,
  },
} as typeof TypeScript
