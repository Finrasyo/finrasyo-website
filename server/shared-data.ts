/**
 * Frontend ve backend arasında paylaşılan veriler
 */

import { bistCompanies as clientBistCompanies } from '../client/src/data/bist-companies';

// Client uygulamasından BIST şirketleri listesini export ederek server'da da kullanılabilir hale getiriyoruz
export const bistCompanies = clientBistCompanies;