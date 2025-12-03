export class Enviroment {
  public readonly localUrl: string = 'https://localhost:7292/api/';
  public readonly publicUrl: string =
    'https://tbilink-api-e9e49368f5e1.herokuapp.com/api/';

  public readonly hubUrlLocal: string = 'https://localhost:7292/hubs/users';

  public readonly hubUrlPublic: string =
    'https://tbilink-api-e9e49368f5e1.herokuapp.com/hubs/users';

  public readonly supabaseUrl: string =
    'https://ypvppaifguwqanzoajan.supabase.co';
  public readonly supabaseAnonKey: string =
    'sb_publishable_9uMm2ynfs_kAxHewlTqOnQ_uOouC-eO';

  public readonly storageUrl: string =
    'https://ypvppaifguwqanzoajan.supabase.co/storage/v1/object/public/Tbilink-Public/';
}
