from TECLIU import  Teclado_LIU

def mostra_pagina(titulo, lista, colunas=7):
    print("\n" + titulo)
    print("-" * len(titulo))
    for i in range(0, len(lista), colunas):
        linha = lista[i:i+colunas]
        for e in linha:
           print(f"{e:4} | ",end="")
        print("")    


grupos = list(Teclado_LIU.keys())
tela1_atual = grupos[:35]
tela2_atual = grupos[35:70]
mostra_pagina("TELA 1 ATUAL", tela1_atual)
mostra_pagina("TELA 2 ATUAL", tela2_atual)
