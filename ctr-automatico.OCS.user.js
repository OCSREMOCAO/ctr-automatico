
 // ==UserScript==
 // @name         Caçambas Online - Download Automático CTR
 // @namespace    https://rcc-spregula.coletas.online/
 // @version      1.2.9
 // @description  Download automático de CTR e fechamento da guia
 // @author       Tarcísio Silveira
 // @match        *://rcc-spregula.coletas.online/*
 // @run-at       document-idle
 // @grant        GM_closeTab
 // @require      https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
 // @updateURL    https://raw.githubusercontent.com/OCSREMOCAO/ctr-automatico/main/ctr-automatico.OCS.user.js
 // @downloadURL  https://raw.githubusercontent.com/OCSREMOCAO/ctr-automatico/main/ctr-automatico.OCS.user.js
 // ==/UserScript==

 (function () {
     'use strict';

     if (!/\/Transportador\/CTR\/ImprimeCTR\.aspx/i.test(location.pathname)) {
         return;
     }

     const VERSAO = '1.2.9';
     const CHAVE = 'ctr-v129-' + location.href;
     const TEMPO_FECHAMENTO = 2000;

     let processando = false;

     const ROTULOS = [
         ['Gerador', /^Gerador$/i],
         ['Transp.', /^Transp\.?$/i],
         ['Destino', /^Destino$/i],
         ['Volumes', /^Volumes$/i],
         ['Assinaturas', /^Assinaturas$/i],
         ['DT', /^DT$/i],
         ['Imagens NFS-e', /^Imagens\s*NFS[-–]?e$/i]
     ];

     function obterNumero() {
         const texto = document.body.innerText || '';
         const match = texto.match(/GG\s*[-–]?\s*(\d{6,})/i);

         if (match) return match[1].padStart(10, '0');

         const titulo = document.title.match(/CTR[-\s]*(\d+)/i);

         return titulo
             ? titulo[1].padStart(10, '0')
             : 'SEM-NUMERO';
     }

     function obterCliente() {
         const texto = document.body.innerText || '';

         const match = texto.match(
             /Nome\/Razão Social:\s*([^\r\n]+)/i
         );

         if (!match) return 'CLIENTE';

         const primeiro = match[1].trim().split(/\s+/)[0];

         return primeiro
             .normalize('NFD')
             .replace(/[\u0300-\u036f]/g, '')
             .replace(/[\\/:*?"<>|]/g, '')
             .toUpperCase() || 'CLIENTE';
     }

     function aviso(mensagem, erro = false) {
         let el = document.getElementById('ctr-aviso');

         if (!el) {
             el = document.createElement('div');
             el.id = 'ctr-aviso';

             Object.assign(el.style, {
                 position: 'fixed',
                 right: '20px',
                 bottom: '20px',
                 padding: '12px 16px',
                 color: '#fff',
                 borderRadius: '7px',
                 font: 'bold 13px Arial',
                 zIndex: '2147483647',
                 maxWidth: '420px',
                 boxShadow: '0 3px 12px #0003'
             });

             document.body.appendChild(el);
         }

         el.style.background = erro ? '#b91c1c' : '#087a36';
         el.textContent = mensagem;
     }

     function encontrarCTR() {
         const candidatos = [
             ...document.querySelectorAll(
                 'table, div, form, section, main'
             )
         ].filter(el => {
             const texto = el.innerText || '';
             const r = el.getBoundingClientRect();

             return (
                 /Controle de Transporte de Resíduos/i.test(texto) &&
                 /Histórico de Alteraç/i.test(texto) &&
                 r.width >= 350 &&
                 r.width <= 750 &&
                 r.height >= 300
             );
         });

         candidatos.sort((a, b) => {
             const ra = a.getBoundingClientRect();
             const rb = b.getBoundingClientRect();

             return ra.width * ra.height -
                    rb.width * rb.height;
         });

         return candidatos[0] || null;
     }

     function encontrarHistorico(raiz) {
         const folhas = [
             ...raiz.querySelectorAll('*')
         ].filter(el =>
             el.children.length === 0 &&
             /Histórico de Alteraç/i.test(
                 (el.textContent || '').trim()
             )
         );

         if (!folhas.length) {
             throw new Error(
                 'Não foi possível localizar o Histórico de Alterações'
             );
         }

         return folhas[0];
     }

     function encontrarLimite(raiz) {
         const historico = encontrarHistorico(raiz);
         const rectRaiz = raiz.getBoundingClientRect();
         const rectHistorico = historico.getBoundingClientRect();

         let bloco = historico;

         while (
             bloco.parentElement &&
             bloco.parentElement !== raiz
         ) {
             const pai = bloco.parentElement;
             const r = pai.getBoundingClientRect();

             if (
                 r.top < rectHistorico.top - 35 &&
                 /Controle de Transporte de Resíduos/i.test(
                     pai.innerText || ''
                 )
             ) {
                 break;
             }

             bloco = pai;
         }

         const rBloco = bloco.getBoundingClientRect();

         let limite = Math.min(
             rectHistorico.top,
             rBloco.top
         ) - rectRaiz.top;

         if (limite < 200) {
             limite = rectHistorico.top - rectRaiz.top;
         }

         if (limite < 200) {
             throw new Error('Limite do documento inválido');
         }

         return Math.floor(limite);
     }

     function localizarRotulos(raiz, limite) {
         const encontrados = [];
         const rectRaiz = raiz.getBoundingClientRect();

         const elementos = [
             ...raiz.querySelectorAll('*')
         ];

         for (const [texto, expressao] of ROTULOS) {
             const folha = elementos.find(el => {
                 if (el.children.length !== 0) return false;

                 if (!expressao.test(
                     (el.textContent || '').trim()
                 )) return false;

                 const celula = el.closest('td, th');

                 if (!celula) return false;

                 const r = celula.getBoundingClientRect();

                 return (
                     r.width <= 85 &&
                     r.height >= 25 &&
                     r.top - rectRaiz.top < limite
                 );
             });

             if (!folha) continue;

             const r = folha.closest('td, th')
                 .getBoundingClientRect();

             encontrados.push({
                 texto,
                 left: r.left,
                 top: r.top,
                 width: r.width,
                 height: r.height
             });
         }

         return encontrados;
     }

     function corrigirRotulos(canvas, rotulos, origem) {
         const ctx = canvas.getContext('2d');

         if (!ctx) {
             throw new Error('Canvas indisponível');
         }

         const sx = canvas.width / origem.width;
         const sy = canvas.height / origem.height;

         let corrigidos = 0;

         for (const r of rotulos) {
             const x = (r.left - origem.left) * sx;
             const y = (r.top - origem.top) * sy;
             const w = r.width * sx;
             const h = r.height * sy;

             if (
                 x < -2 || y < -2 ||
                 x + w > canvas.width + 2 ||
                 y + h > canvas.height + 2
             ) {
                 continue;
             }

             ctx.save();

             const sobra = Math.min(
                 20 * sx,
                 Math.max(0, x)
             );

             const borda = Math.max(1, sx);

             ctx.fillStyle = '#ffffff';

             ctx.fillRect(
                 Math.max(0, x - sobra),
                 y + borda,
                 Math.max(1, w + sobra - borda * 2),
                 Math.max(1, h - borda * 2)
             );

             ctx.strokeStyle = '#222222';
             ctx.lineWidth = Math.max(1, sx);

             ctx.beginPath();
             ctx.moveTo(x, y);
             ctx.lineTo(x, y + h);
             ctx.moveTo(x, y);
             ctx.lineTo(x + w, y);
             ctx.moveTo(x, y + h);
             ctx.lineTo(x + w, y + h);
             ctx.stroke();

             ctx.translate(x + w / 2, y + h / 2);
             ctx.rotate(-Math.PI / 2);

             ctx.fillStyle = '#000000';
             ctx.font = `bold ${Math.max(10, 13 * sx)}px Arial`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';

             ctx.fillText(
                 r.texto,
                 0,
                 0,
                 Math.max(1, h - borda * 4)
             );

             ctx.restore();
             corrigidos++;
         }

         return corrigidos;
     }

     function fecharGuia() {
         if (!/\/Transportador\/CTR\/ImprimeCTR\.aspx/i.test(
             location.pathname
         )) return;

         console.log(
             '[CTR ' + VERSAO + '] Solicitando fechamento da guia'
         );

         try {
             if (typeof GM_closeTab === 'function') {
                 GM_closeTab();
             } else {
                 window.close();
             }
         } catch (erro) {
             console.warn(
                 '[CTR] Fechamento automático não permitido:',
                 erro
             );
         }
     }

     function criarBotao() {
         if (document.getElementById('ctr-baixar')) return;

         const btn = document.createElement('button');
         btn.id = 'ctr-baixar';
         btn.textContent = 'BAIXAR CTR PDF';

         Object.assign(btn.style, {
             position: 'fixed',
             top: '15px',
             right: '20px',
             background: '#087a36',
             color: '#fff',
             padding: '12px 18px',
             border: 'none',
             borderRadius: '7px',
             font: 'bold 13px Arial',
             cursor: 'pointer',
             zIndex: '2147483647'
         });

         btn.addEventListener('click', () => baixar(true));
         document.body.appendChild(btn);
     }

     async function baixar(manual = false) {
         if (processando) return;
         if (!manual && sessionStorage.getItem(CHAVE)) return;

         if (typeof html2pdf !== 'function') {
             aviso('Biblioteca html2pdf não carregada.', true);
             return;
         }

         const raiz = encontrarCTR();

         if (!raiz) {
             aviso('Não foi possível localizar a CTR.', true);
             return;
         }

         processando = true;

         const btn = document.getElementById('ctr-baixar');
         const numero = obterNumero();
         const cliente = obterCliente();
         const nome = cliente + ' - CTR-' + numero + '.pdf';

         if (btn) btn.textContent = 'GERANDO PDF...';
         aviso('Gerando ' + nome + '...');

         try {
             await document.fonts.ready;

             const rect = raiz.getBoundingClientRect();
             const limite = encontrarLimite(raiz);
             const rotulos = localizarRotulos(raiz, limite);

             const worker = html2pdf().set({
                 margin: 0,
                 html2canvas: {
                     scale: 2,
                     useCORS: true,
                     backgroundColor: '#ffffff',
                     scrollX: 0,
                     scrollY: 0,
                     logging: false
                 },
                 jsPDF: {
                     unit: 'mm',
                     format: 'a4',
                     orientation: 'portrait'
                 }
             });

             const canvas = await worker
                 .from(raiz)
                 .toCanvas()
                 .get('canvas');

             if (!canvas?.width || !canvas?.height) {
                 throw new Error('Falha na captura');
             }

             const alturaRaiz = Math.max(
                 raiz.scrollHeight,
                 rect.height
             );

             const corte = Math.min(
                 canvas.height,
                 Math.floor(
                     limite * canvas.height / alturaRaiz
                 )
             );

             if (corte <= 0) {
                 throw new Error('Recorte inválido');
             }

             const recorte = document.createElement('canvas');
             recorte.width = canvas.width;
             recorte.height = corte;

             const ctx = recorte.getContext('2d');

             if (!ctx) {
                 throw new Error('Canvas indisponível');
             }

             ctx.fillStyle = '#ffffff';
             ctx.fillRect(
                 0, 0,
                 recorte.width,
                 recorte.height
             );

             ctx.drawImage(
                 canvas,
                 0, 0,
                 canvas.width, corte,
                 0, 0,
                 recorte.width, corte
             );

             const corrigidos = corrigirRotulos(
                 recorte,
                 rotulos,
                 {
                     left: rect.left,
                     top: rect.top,
                     width: rect.width,
                     height: corte * alturaRaiz / canvas.height
                 }
             );

             console.log(
                 '[CTR ' + VERSAO + '] Rótulos corrigidos:',
                 corrigidos,
                 'de',
                 rotulos.length
             );

             const finalWorker = html2pdf().set({
                 margin: [8, 8, 8, 8],
                 filename: nome,
                 image: {
                     type: 'jpeg',
                     quality: 0.98
                 },
                 html2canvas: {
                     scale: 1,
                     backgroundColor: '#ffffff'
                 },
                 jsPDF: {
                     unit: 'mm',
                     format: 'a4',
                     orientation: 'portrait'
                 }
             });

             await finalWorker
                 .from(recorte, 'canvas')
                 .save();

             sessionStorage.setItem(CHAVE, 'feito');

             aviso(
                 nome + ' gerado. Fechando guia em 2 segundos...'
             );

             console.log(
                 '[CTR ' + VERSAO + '] Download solicitado:',
                 nome
             );

             setTimeout(fecharGuia, TEMPO_FECHAMENTO);

         } catch (erro) {
             console.error('[CTR ' + VERSAO + ']', erro);

             aviso(
                 'Erro: ' + (erro.message || String(erro)),
                 true
             );

         } finally {
             processando = false;
             if (btn) btn.textContent = 'BAIXAR CTR PDF';
         }
     }

     function iniciar() {
         criarBotao();
         setTimeout(() => baixar(false), 2500);
     }

     if (document.readyState === 'loading') {
         document.addEventListener(
             'DOMContentLoaded',
             iniciar,
             { once: true }
         );
     } else {
         iniciar();
     }

 })();
