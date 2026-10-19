# Recursos da Mesa 3D

Os arquivos são servidos localmente. Nenhum recurso exige conta, chave de API ou conexão com um CDN durante o uso.

| Recurso | Origem | Licença | Uso |
| --- | --- | --- | --- |
| Wood Table 001 | https://polyhaven.com/a/wood_table_001 | CC0 | Cor, normal OpenGL e rugosidade da nogueira; JPG 1K. |
| Fabric Pattern 07 | https://polyhaven.com/a/fabric_pattern_07 | CC0 | Normal map 1K da microestrutura do tecido. Cor, desenho e bordado celeste são originais. |
| Studio Small 09 | https://polyhaven.com/a/studio_small_09 | CC0 | Iluminação e reflexos, convertidos para `observatory.env`, cubemap 128 com mipmaps pré-filtrados e harmônicos. |
| Cormorant Garamond | https://fonts.google.com/specimen/Cormorant+Garamond | SIL Open Font License 1.1 | Fonte editorial, normal e itálico; WOFF2 latino. Licença integral em `fonts/cormorantgaramond-OFL.txt`. |
| Outfit | https://fonts.google.com/specimen/Outfit | SIL Open Font License 1.1 | Controles e textos; WOFF2 latino. Licença integral em `fonts/outfit-OFL.txt`. |
| Verso Lumina Observatory | `public/tarot/backs/lumina-observatory.svg` | MIT do repositório | Mesmo desenho do santuário; dimensões explícitas permitem carregamento por WebGL. |
| Modelagem, bordado, Lua, ícones e interfaces | Código TypeScript/CSS/SVG do repositório | MIT | Geometria e desenhos originais. |

Licença dos assets Poly Haven: https://polyhaven.com/license (CC0, inclusive uso comercial e redistribuição).

URLs de download dos originais:

- https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table_001/wood_table_001_diff_1k.jpg
- https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table_001/wood_table_001_nor_gl_1k.jpg
- https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table_001/wood_table_001_rough_1k.jpg
- https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/fabric_pattern_07/fabric_pattern_07_nor_gl_1k.jpg
- https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr

O HDR original fica em `assets-src/mesa-3d`, fora do conteúdo publicado. Para regenerar o ENV, inicie o Vite em 5173 e execute `node scripts/prepare-mesa-environment.mjs`. A conversão usa as ferramentas oficiais do Babylon e Chromium/SwiftShader, sem serviço externo.

As artes de Tarot e Lenormand permanecem nas coleções documentadas em `public/tarot` e `src/data/cardArtwork.js`.
