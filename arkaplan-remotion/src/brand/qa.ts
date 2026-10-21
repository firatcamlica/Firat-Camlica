import {createContext, useContext} from 'react';

// qa=true: zemin, fotoğraf ve çizimler gizlenir, yalnızca metin çizilir (3:4 kırpma taraması için).
export const QaContext = createContext(false);
export const useQa = () => useContext(QaContext);
