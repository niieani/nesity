import { ESLintConfig, Rules } from '@beemo/driver-eslint'

const config: ESLintConfig & { rules: Rules } = {
  rules: {
    '@typescript-eslint/lines-between-class-members': 'off',
    'import/no-unresolved': 'off',
  },
}

export default config
