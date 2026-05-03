const LIU_LOCAL_KEY = "liu777_config_v1";
const MAX_TEXTO_LOCAL = 5000;
const MAX_EMOJIS_HIST = 105;
let LANG_TXT = {};
let teclado_visivel = false;
let KB_JSON = [];
let KB_BASES = [];
let KB_MAP = {};
let kb_tela = "base";
let kb_pagina = 1;
let kb_modo = "normal";
let kb_base_sel = "";
let kb_fixado = false;
let kb_grade = [];
let COR_LIU = {};


let liu_last = null;

async function aplica_LIU(){
let campo = document.getElementById("liu_input");
let inicio = campo.selectionStart;
let fim = campo.selectionEnd;
let original = campo.value;
if (liu_last && campo.value === liu_last.after) {
    campo.value = liu_last.before;
    campo.selectionStart = liu_last.ini;
    campo.selectionEnd = liu_last.fim;
    liu_last = {before: liu_last.after, after: liu_last.before, ini: liu_last.ini, fim: liu_last.fim};
    salvar_estado_local();
    return;
}
let tem_sel = inicio !== fim;
let trecho = tem_sel ? original.slice(inicio, fim) : original;
let cfg = get_config();
let resposta = await fetch("http://127.0.0.1:8000/efu_liu",{ 
//let resposta = await fetch("https://liu777.org:8000/liu", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({texto: trecho, idioma: cfg.idioma})
});
let dados = await resposta.json();
let novo = dados.texto || trecho;
let final;
let novo_ini;
let novo_fim;
if (tem_sel) {
    final = original.slice(0, inicio) + novo + original.slice(fim);
    novo_ini = inicio;
    novo_fim = inicio + novo.length;
} else {
    final = novo;
    novo_ini = 0;
    novo_fim = novo.length;
}
liu_last = {before: original, after: final, ini: inicio, fim: fim};
campo.value = final;
campo.selectionStart = novo_ini;
campo.selectionEnd = novo_fim;
salvar_estado_local();
}


function get_flag_img(t) {
let code = t.code || "ig";
let mapa = {
pt: "br",
ig: "us",
de: "de",
es: "es",
fr: "fr",
it: "it",
ru: "ru",
ch: "cn",
jp: "jp"
};
let flag_code = mapa[code] || "us";
return "flags_png/" + flag_code + ".png";
}

function emoji_flag_to_code(e) {
if (!e) return "";
if (e === "🏳️") return "";
if (e === "🏴") return "";
if (e === "🏁") return "";
if (e === "🏳️‍🌈") return "";
let cps = Array.from(e);
if (cps.length < 2) return "";
let a = cps[0].codePointAt(0);
let b = cps[1].codePointAt(0);
let base = 0x1F1E6;
if (a < base || a > base + 25) return "";
if (b < base || b > base + 25) return "";
let c1 = String.fromCharCode(97 + a - base);
let c2 = String.fromCharCode(97 + b - base);
return c1 + c2;
}

function cria_conteudo_botao(b, e) {
let code = emoji_flag_to_code(e);
if (code) {
    let img = document.createElement("img");
    img.src = "flags_png/" + code + ".png";
    img.className = "flag_btn_img";
    img.alt = e;
    img.title = e;
    b.innerHTML = "";
    b.appendChild(img);
} else {
    b.innerText = troca_cor(e);
}
}

async function carregar_cor_json() {
try {
    let resp = await fetch("cor_LIU_ktv1.json");
    COR_LIU = await resp.json();
} catch (e) {
    console.log("Erro carregando cor_LIU_ktv1.json", e);
    COR_LIU = {};
}
}

function troca_cor(emoji) {
let cfg = get_config();
let idx = Number(cfg.skin || 0);
if (idx < 0 || idx > 5) idx = 0;
if (!emoji) return "";
if (!COR_LIU[emoji]) return emoji;
return COR_LIU[emoji][idx] || emoji;
}

async function carregar_language_json() {
    try {
        let resp = await fetch("language.json");
        LANG_TXT = await resp.json();
    } catch (e) {
        console.log("Erro carregando language.json", e);
        LANG_TXT = {};
    }
}

function corta_texto(s) {
if (!s) return "";
return s.substring(0, MAX_TEXTO_LOCAL);
}

function get_config() {
let raw = localStorage.getItem(LIU_LOCAL_KEY);
let dados = {};
if (raw) {
try { dados = JSON.parse(raw); } catch (e) { dados = {}; }
}
return {
idioma: dados.idioma || "English",
skin: dados.skin ?? 0,
font: dados.font || "normal",
op4: dados.op4 ?? false,
save_hist: dados.save_hist ?? true,
save_fix: dados.save_fix ?? false,
};
}

function get_config_tela() {
return {
idioma: document.getElementById("cfg_idioma").value,
skin: Number(document.getElementById("cfg_skin").value),
font: document.getElementById("cfg_font").value,
op4: document.getElementById("cfg_op4").checked,
save_hist: document.getElementById("cfg_save_hist").checked,
save_fix: document.getElementById("cfg_save_fix").checked,

};
}

function salvar_estado_local() {
let cfg = get_config_tela();
let dados = {
idioma: cfg.idioma,
skin: cfg.skin,
font: cfg.font,
op4: cfg.op4,
save_hist: cfg.save_hist,
save_fix: cfg.save_fix,
liu_input: cfg.op4 ? corta_texto(document.getElementById("liu_input").value) : "",
emoji_hist: cfg.save_hist ? JSON.parse(localStorage.getItem("emoji_hist") || "[]").slice(0, MAX_EMOJIS_HIST) : []
};
localStorage.setItem(LIU_LOCAL_KEY, JSON.stringify(dados));
if (!cfg.save_hist) localStorage.removeItem("emoji_hist");
}

function on_idioma_config_change() {
salvar_estado_local();
aplica_linguagem_tela();
}

function salvar_config_fechar() {
salvar_estado_local();
aplica_linguagem_tela();
kb_atualiza_grade();
aplica_tamanho_tela();
fechar_config();
}

function carregar_estado_local() {
let raw = localStorage.getItem(LIU_LOCAL_KEY);
let dados = {};
if (raw) {
try { dados = JSON.parse(raw); } catch (e) { dados = {}; }
} else {
dados = {
    idioma: "English",
    skin: 0,
    font: "normal",
    op4: false,
    save_hist: true,
    save_fix: false,
    liu_input: "",
    emoji_hist: []
};
localStorage.setItem(LIU_LOCAL_KEY, JSON.stringify(dados));
}

document.getElementById("cfg_idioma").value = dados.idioma || "English";
document.getElementById("cfg_skin").value = dados.skin ?? 0;
document.getElementById("cfg_font").value = dados.font || "normal";
document.getElementById("cfg_op4").checked = dados.op4 ?? false;
document.getElementById("cfg_save_hist").checked = dados.save_hist ?? true;
document.getElementById("cfg_save_fix").checked = dados.save_fix ?? false;

if (dados.op4) {
document.getElementById("liu_input").value = dados.liu_input || "";
} else {
document.getElementById("liu_input").value = "";
}

if (dados.save_hist && Array.isArray(dados.emoji_hist)) {
localStorage.setItem("emoji_hist", JSON.stringify(dados.emoji_hist.slice(0, MAX_EMOJIS_HIST)));
}
}

function abrir_config() {
carregar_config_para_tela();
document.getElementById("config_panel").classList.remove("hidden");
}

function fechar_config() {
document.getElementById("config_panel").classList.add("hidden");
}

function carregar_config_para_tela() {
let cfg = get_config();
document.getElementById("cfg_idioma").value = cfg.idioma;
document.getElementById("cfg_skin").value = cfg.skin;
document.getElementById("cfg_font").value = cfg.font;
document.getElementById("cfg_op4").checked = cfg.op4;
document.getElementById("cfg_save_hist").checked = cfg.save_hist;
document.getElementById("cfg_save_fix").checked = cfg.save_fix;

}


function salvar_hist(e) {
let cfg = get_config();
if (!cfg.save_hist) return;
let hist = JSON.parse(localStorage.getItem("emoji_hist") || "[]");
hist = hist.filter(x => x !== e);
hist.unshift(e);
hist = hist.slice(0, MAX_EMOJIS_HIST);
localStorage.setItem("emoji_hist", JSON.stringify(hist));
salvar_estado_local();
}

function aplica_tamanho_tela() {
let cfg = get_config();
let campo = document.getElementById("liu_input");
let botoes = document.querySelectorAll(".kb_btn");
if (cfg.font === "small") {
    campo.style.fontSize = "20px";
    campo.style.height = "80px";
    botoes.forEach(b => {
        b.style.fontSize = "30px";
        b.style.height = "32px";
        b.style.lineHeight = "30px";
    });
}
if (cfg.font === "normal") {
    campo.style.fontSize = "35px";
    campo.style.height = "140px";
    botoes.forEach(b => {
        b.style.fontSize = "40px";
        b.style.height = "44px";
        b.style.lineHeight = "40px";
    });
}
if (cfg.font === "large") {
    campo.style.fontSize = "50px";
    campo.style.height = "150px";
    botoes.forEach(b => {
        b.style.fontSize = "60px";
        b.style.height = "65px";
        b.style.lineHeight = "60px";
    });
}
}


function aplica_linguagem_tela() {
let cfg = get_config();
let lang = cfg.idioma || "English";
let t = LANG_TXT[lang] || LANG_TXT["English"];
if (!t) return;

document.title = t.app_title || "Emoji Fácil";
document.getElementById("band_idioma").src = get_flag_img(t);
document.getElementById("txt_title").innerText = t.title;
document.getElementById("txt_title2").innerText = t.title2;

document.getElementById("btn_copy").innerText = t.copy;
document.getElementById("btn_paste").innerText = t.paste;
document.getElementById("btn_clear").innerText = t.clear;

document.getElementById("cfg_title").innerText = t.config_title;
document.getElementById("cfg_lbl_language").innerText = t.language;
document.getElementById("cfg_lbl_skin").innerText = t.skin;
document.getElementById("cfg_lbl_font").innerText = t.font;
document.getElementById("cfg_lbl_op4").innerText = t.keep_last;
document.getElementById("cfg_lbl_save_hist").innerText = t.save_hist;
document.getElementById("cfg_lbl_save_fix").innerText = t.save_fix;
document.getElementById("cfg_btn_save").innerText = t.save;

document.getElementById("txt_made").innerText = t.made;
document.getElementById("txt_help").innerText = t.help;
document.getElementById("txt_support").innerText = t.support;
document.getElementById("txt_help").href = t.help_HTML;
document.getElementById("txt_support").href = t.support_HTML;
document.querySelector('#cfg_font option[value="small"]').innerText = t.font_small || "Small";
document.querySelector('#cfg_font option[value="normal"]').innerText = t.font_normal || "Normal";
document.querySelector('#cfg_font option[value="large"]').innerText = t.font_large || "Large";

let botoes_extra = document.querySelectorAll(".kb_extra button");
botoes_extra[0].innerText = t.backspace;
botoes_extra[2].innerText = t.space;
botoes_extra[4].innerText = t.delete;
document.body.classList.remove("font-small", "font-normal", "font-large");
document.body.classList.add("font-" + cfg.font);
aplica_tamanho_tela();
}

async function carregar_teclado_json() {
let resp = await fetch("Teclado_LIU.json");
KB_JSON = await resp.json();
KB_BASES = [];
KB_MAP = {};
KB_JSON.forEach(item => {
    let base = item.base || "";
    if (!base) return;
    KB_BASES.push(base);
    let lista = [];
    for (let i = 1; i <= 35; i++) {
        let chave = "e" + String(i).padStart(2, "0");
        let val = item[chave] || "";
        if (typeof val === "string" && val.startsWith("_")) val = "";
        lista.push(val);
    }
    KB_MAP[base] = lista;
});
}


function kb_set_ctrl() {
let botoes = document.querySelectorAll(".kb_ctrl button");
if (kb_tela === "final") {
    botoes[0].innerText = "⬅️";
    botoes[1].innerText = "➡️";
    botoes[2].innerText = "↪️";
    botoes[3].innerText = "";
    botoes[4].innerText = kb_fixado ? "📍" : "📌";
} else {
    botoes[0].innerText = "";
    botoes[1].innerText = "1️⃣";
    botoes[2].innerText = "2️⃣";
    botoes[3].innerText = "Ⓜ️";
    botoes[4].innerText = "";
}
}

function kb_atualiza_grade() {
if (kb_modo === "historico") {
    kb_grade = JSON.parse(localStorage.getItem("emoji_hist") || "[]").slice(0, 35);
} else if (kb_tela === "base") {
    let ini = (kb_pagina - 1) * 35;
    kb_grade = KB_BASES.slice(ini, ini + 35);
} else {
    kb_grade = (KB_MAP[kb_base_sel] || []).slice(0, 35);
}
while (kb_grade.length < 35) kb_grade.push("");
render_teclado();
kb_set_ctrl();
}


function kb_insere_indice(n) {
let emoji = kb_grade[n] || "";
if (!emoji) return;
if (kb_tela === "base" && kb_modo !== "historico") {
    kb_base_sel = emoji;
    kb_tela = "final";
    kb_modo = "normal";
    kb_atualiza_grade();
    return;
}
inserir_emoji(emoji);
if (kb_tela === "final" && !kb_fixado) {
    kb_tela = "base";
    kb_modo = "normal";
    kb_atualiza_grade();
}
}


function render_teclado() {
let area = document.getElementById("kb_area");
area.innerHTML = "";
for (let i = 0; i < 35; i++) {
    let e = kb_grade[i] || "";
    let b = document.createElement("button");
    cria_conteudo_botao(b, e);
    b.className = "kb_btn";
    if (e !== "") {
        b.onclick = function() { kb_insere_indice(i); };
    }
    area.appendChild(b);
}
aplica_tamanho_tela();
}

function is_mobile() {
return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function inserir_emoji(e) {
e = troca_cor(e);
let campo = document.getElementById("liu_input");
let inicio = campo.selectionStart;
let fim = campo.selectionEnd;
let texto = campo.value;
campo.value = texto.slice(0, inicio) + e + texto.slice(fim);
let nova_pos = inicio + e.length;
campo.selectionStart = nova_pos;
campo.selectionEnd = nova_pos;
//campo.focus();
salvar_hist(e);
salvar_estado_local();
}

function kb_backspace() {
let campo = document.getElementById("liu_input");
let inicio = campo.selectionStart;
let fim = campo.selectionEnd;
if (inicio === fim && inicio > 0) {
    campo.value = campo.value.slice(0, inicio - 1) + campo.value.slice(fim);
    campo.selectionStart = inicio - 1;
    campo.selectionEnd = inicio - 1;
} else {
    campo.value = campo.value.slice(0, inicio) + campo.value.slice(fim);
    campo.selectionStart = inicio;
    campo.selectionEnd = inicio;
}
campo.focus();
}

function get_graphemes(s) {
if (window.Intl && Intl.Segmenter) {
    let seg = new Intl.Segmenter(undefined, {granularity: "grapheme"});
    return Array.from(seg.segment(s), x => ({txt:x.segment, ini:x.index, fim:x.index + x.segment.length}));
}
let out = [];
let p = 0;
for (let ch of Array.from(s)) {
    out.push({txt:ch, ini:p, fim:p + ch.length});
    p += ch.length;
}
return out;
}

function kb_cursor_left() {
let campo = document.getElementById("liu_input");
let p = campo.selectionStart;
let gs = get_graphemes(campo.value);
let novo = 0;
for (let g of gs) {
    if (g.fim < p) novo = g.fim;
    if (g.fim >= p) break;
}
campo.selectionStart = novo;
campo.selectionEnd = novo;
campo.focus();
}

function kb_cursor_right() {
let campo = document.getElementById("liu_input");
let p = campo.selectionStart;
let gs = get_graphemes(campo.value);
let novo = campo.value.length;
for (let g of gs) {
    if (g.ini >= p) {
        novo = g.fim;
        break;
    }
}
campo.selectionStart = novo;
campo.selectionEnd = novo;
campo.focus();
}

function kb_clear() {
let campo = document.getElementById("liu_input");
let inicio = campo.selectionStart;
let fim = campo.selectionEnd;
if (inicio !== fim) {
    campo.value = campo.value.slice(0, inicio) + campo.value.slice(fim);
    campo.selectionStart = inicio;
    campo.selectionEnd = inicio;
    campo.focus();
    return;
}
let gs = get_graphemes(campo.value);
for (let g of gs) {
    if (g.ini >= inicio) {
        campo.value = campo.value.slice(0, g.ini) + campo.value.slice(g.fim);
        campo.selectionStart = g.ini;
        campo.selectionEnd = g.ini;
        break;
    }
}
campo.focus();
}

function kb_space() {
inserir_emoji(" ");
}


function kb_pagina1() {
if (kb_tela === "final") {
    kb_tela = "base";
    kb_modo = "normal";
    let cfg = get_config();  
    if (!cfg.save_fix) kb_fixado = false;
    kb_pagina = 1;
    kb_atualiza_grade();
    return;
}
kb_tela = "base";
kb_modo = "normal";
kb_pagina = 1;
kb_atualiza_grade();
}

function kb_pagina2() {
if (kb_tela === "final") {
    kb_grupo_anterior();
    return;
}
kb_tela = "base";
kb_modo = "normal";
kb_pagina = 2;
kb_atualiza_grade();
}

function kb_memoria() {
if (kb_tela === "final") {
    kb_fixado = !kb_fixado;
    kb_set_ctrl();
    return;
}
kb_tela = "base";
kb_modo = "historico";
kb_atualiza_grade();
}


function kb_ctrl0() {
if (kb_tela === "final") {
    kb_grupo_anterior();
}
}

function kb_ctrl1() {
if (kb_tela === "final") {
    kb_grupo_proximo();
} else {
    kb_pagina1();
}
}

function kb_ctrl2() {
if (kb_tela === "final") {
    kb_pagina1();
} else {
    kb_pagina2();
}
}

function kb_ctrl3() {
if (kb_tela === "base") {
    kb_memoria();
}
}

function kb_ctrl4() {
if (kb_tela === "final") {
    kb_memoria();
}
}

function kb_grupo_anterior() {
if (!kb_base_sel) return;
let idx = KB_BASES.indexOf(kb_base_sel);
if (idx < 0) return;
idx = idx - 1;
if (idx < 0) idx = KB_BASES.length - 1;
kb_base_sel = KB_BASES[idx];
kb_tela = "final";
kb_modo = "normal";
kb_atualiza_grade();
}

function kb_grupo_proximo() {
if (!kb_base_sel) return;
let idx = KB_BASES.indexOf(kb_base_sel);
if (idx < 0) return;
idx = idx + 1;
if (idx >= KB_BASES.length) idx = 0;
kb_base_sel = KB_BASES[idx];
kb_tela = "final";
kb_modo = "normal";
kb_atualiza_grade();
}

function kb_fechar_ou_proximo() {
if (kb_tela === "final") {
    kb_grupo_proximo();
    return;
}
kb_tela = "base";
kb_modo = "normal";
kb_atualiza_grade();
}

async function copiar_texto() {
let campo = document.getElementById("liu_input");
await navigator.clipboard.writeText(campo.value);
}

async function colar_texto() {
let campo = document.getElementById("liu_input");
let txt = await navigator.clipboard.readText();
let inicio = campo.selectionStart;
let fim = campo.selectionEnd;
campo.value = campo.value.slice(0, inicio) + txt + campo.value.slice(fim);
campo.selectionStart = inicio + txt.length;
campo.selectionEnd = inicio + txt.length;
campo.focus();
}

function limpar_texto() {
document.getElementById("liu_input").value = "";
document.getElementById("liu_input").focus();
}

async function inicializa_app() {
await carregar_language_json();
await carregar_cor_json();
await carregar_teclado_json();
carregar_estado_local();
aplica_linguagem_tela();
kb_tela = "base";
kb_modo = "normal";
kb_pagina = 1;
kb_atualiza_grade();
document.getElementById("liu_input").addEventListener("input", salvar_estado_local);
}

inicializa_app();
