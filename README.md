
<div align="center">

# 📄 CTR Automático | Caçambas Online

### Download automático de Controle de Transporte de Resíduos

**Script desenvolvido para automatizar o download de CTRs em PDF no sistema Caçambas Online.**

<br>

[![Instalar no Tampermonkey](https://img.shields.io/badge/⬇%20INSTALAR%20SCRIPT-008000?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/OCSREMOCAO/ctr-automatico/main/ctr-automatico.OCS.user.js)

<br>

![Versão](https://img.shields.io/badge/Versão-1.2.9-blue?style=flat-square)
![Plataforma](https://img.shields.io/badge/Plataforma-Tampermonkey-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Ativo-brightgreen?style=flat-square)

</div>

---

## 🚀 Funcionalidades

- ✅ Download automático ao abrir uma CTR
- ✅ PDF em uma única página A4
- ✅ Remove o Histórico de Alterações
- ✅ Corrige textos verticais e bordas
- ✅ Compatível com diferentes modelos de CTR
- ✅ Identifica o primeiro nome do cliente
- ✅ Inclui o número da CTR no nome do arquivo
- ✅ Fecha automaticamente a guia após solicitar o download
- ✅ Botão para baixar manualmente
- ✅ Suporte a atualizações automáticas pelo GitHub

---

## 📥 Instalação

**1.** Instale a extensão Tampermonkey no navegador.

**2.** Clique no botão abaixo:

<div align="center">

[![INSTALAR CTR AUTOMÁTICO](https://img.shields.io/badge/INSTALAR%20CTR%20AUTOMÁTICO-008000?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/OCSREMOCAO/ctr-automatico/main/ctr-automatico.OCS.user.js)

</div>

**3.** Na tela do Tampermonkey, clique em **Instalar**.

**4.** Acesse o sistema Caçambas Online normalmente.

---

## ⚙️ Como funciona

Ao abrir uma CTR em uma nova guia:

1. O script identifica automaticamente o documento.
2. Captura as informações da CTR.
3. Gera o arquivo PDF.
4. Inicia o download.
5. Aguarda 2 segundos.
6. Solicita o fechamento da guia.

A página principal do sistema permanece aberta.

> O fechamento da guia depende das permissões do navegador e do Tampermonkey.

---

## 📁 Nome dos arquivos

Os arquivos são nomeados automaticamente utilizando o primeiro nome do cliente e o número da CTR.

**Exemplo:**

`ANTONIO - CTR-0032911670.pdf`

---

## 🔄 Atualizações automáticas

O script utiliza os endereços `@updateURL` e `@downloadURL` do GitHub.

Quando uma nova versão for publicada, o Tampermonkey poderá detectar e instalar a atualização conforme suas configurações.

---

## 🛠️ Informações técnicas

| Informação | Detalhes |
|---|---|
| Script | CTR Automático |
| Versão | 1.2.9 |
| Plataforma | Tampermonkey |
| Navegador | Google Chrome |
| Sistema | Caçambas Online |
| Formato | PDF A4 |
| Autor | Tarcísio Silveira |

---

## ⚠️ Observações

Este projeto é uma ferramenta independente de automação e não possui vínculo oficial com o sistema Caçambas Online.

O script não altera os dados registrados no sistema. A geração do PDF utiliza as informações exibidas na página.

A compatibilidade pode ser afetada por mudanças na estrutura do site.

---

<div align="center">

**Desenvolvido por Tarcísio Silveira**

**OCS Remoção de Caçambas**

Versão 1.2.9

</div>
