import { NameLanguage, pickName } from './LocalizedName';

export class Terminal {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public tid: string,
    public nameEn: string = '',
    public nameTh: string = ''
  ) {}

  public displayName(language: NameLanguage): string {
    return pickName(language, this.nameEn, this.nameTh);
  }
}
