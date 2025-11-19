import { icons, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

export function provideLucideIcons() {
  return {
    provide: LUCIDE_ICONS,
    multi: true,
    useValue: new LucideIconProvider(icons),
  };
}
