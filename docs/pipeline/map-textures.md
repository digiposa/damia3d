# Textures des cartes — densité standard

Toutes les cartes partagent la même densité de texture pour rester cohérentes. Les
constantes sont dans `src/world/kit/texels.ts`.

| Surface | Densité | Exemples |
|---|---|---|
| Sol jouable et tout ce qu'on voit de près | **20 px / unité** (`GROUND_PPU`) | dalles de l'arène, chemins de la Forêt, pente et village de Seles |
| Décor lointain ou hors d'atteinte | **10 px / unité** (`FAR_PPU`) | parois de falaise, mer, replats inaccessibles |

Repères : Dart mesure environ 1,8 unité. À 20 px/unité, un pas couvre une trentaine de
pixels de sol. Au-delà, la différence ne se voit plus au zoom ×1.

## Règles

1. **Taille maximale d'une texture : 2048 px de côté** (`MAX_TEX`). Beaucoup de téléphones
   refusent au-delà de 4096, et la mémoire grimpe vite. Une couche peinte plus grande est
   découpée en morceaux, chacun avec sa texture et son mesh (voir `buildTrack` dans
   `Forest.ts`).
2. **Grandes surfaces** : un motif répété à 20 px/unité (terre, herbe, dalles), avec
   par-dessus une couche peinte pour ce qui est unique (chemins, brûlures, ombres).
3. **Les détails gardent leur taille réelle**, pas leur taille en pixels. Les cailloux et
   les mottes font un dixième d'unité : ils sont tirés sur une grille fixe (`hash01` de
   `kit/noise.ts`), pas pixel par pixel. Changer la densité affine les bords sans
   rapetisser les détails.
4. **Échantillonnage au plus proche** (`NEAREST_SAMPLINGMODE`) pour les couches peintes :
   pixels nets, comme sur PS1.

## État des cartes

- Arène de Lohan : dalles à 20 px/unité.
- Forêt : herbe à environ 21 px/unité ; chemins peints à 20, en 3 morceaux ; falaise et mer
  en décor lointain.
- Seles : pente peinte à 20 ; sol du village à 20 (tuile de 128 px pour 6,4 unités). Les
  murs (texture de pierre sur des boîtes) ne suivent pas encore la règle.
