import 'styled-components';
import type { Theme } from '@apisit110/pos-ui';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
