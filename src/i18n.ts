import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import tr from './locales/tr.json';
import pt from './locales/pt.json';
import id from './locales/id.json';
import hi from './locales/hi.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import sv from './locales/sv.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import no from './locales/no.json';
import ko from './locales/ko.json';
import el from './locales/el.json';
import cs from './locales/cs.json';
import hu from './locales/hu.json';
import th from './locales/th.json';

const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    ar: { translation: ar },
    es: { translation: es },
    tr: { translation: tr },
    pt: { translation: pt },
    id: { translation: id },
    hi: { translation: hi },
    fr: { translation: fr },
    it: { translation: it },
    de: { translation: de },
    ja: { translation: ja },
    nl: { translation: nl },
    pl: { translation: pl },
    sv: { translation: sv },
    da: { translation: da },
    fi: { translation: fi },
    no: { translation: no },
    ko: { translation: ko },
    el: { translation: el },
    cs: { translation: cs },
    hu: { translation: hu },
    th: { translation: th },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;