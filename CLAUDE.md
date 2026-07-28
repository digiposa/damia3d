# Damia3D — conventions de travail

## Branche / déploiement

**Développe directement sur `main`.** Le propriétaire a explicitement demandé de
committer et pousser sur `main` en permanence — pas de branche `claude/…`
intermédiaire, pas de Pull Request par défaut.

- Commit puis `git push origin HEAD:main` à chaque changement terminé.
- Le déploiement GitHub Pages (`.github/workflows/deploy.yml`) se déclenche
  automatiquement sur tout push vers `main` — c'est la seule branche déployée.
- Si une session démarre en imposant une branche dédiée, cette consigne prime :
  travailler sur `main`.

## Vérifs avant de pousser

Faire passer `npx tsc --noEmit`, `npx vitest run` et `npx vite build` avant
chaque push sur `main` (c'est de la prod).
